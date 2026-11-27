import { describe, it, expect } from "vitest";
import { answerProgress, emptyTopic, hubQuestion, topicStats, weakestTopic, missedQuestions, mayAnswerHub, normalizeTopicProgress, recommendedTopic, missedReviewState, HUB_TOPICS } from "./test-hub";

const question = hubQuestion({ q: "During your morning drive, what does a red light mean?", options: ["Stop", "Go"], correct: 0, explanation: "Stop at the limit line." }, "signs");
describe("Permit Test Hub rules", () => {
  it('never recommends an exhausted Free topic', () => {
    expect(recommendedTopic(HUB_TOPICS.map(emptyTopic), {}, false, [{feature:'signs',free_slot:true,completed:true}])).toBe('intersections');
  });
  it('offers upgrade rather than a topic when all Free quizzes are exhausted', () => {
    expect(recommendedTopic(HUB_TOPICS.map(emptyTopic), {}, false, HUB_TOPICS.map(feature=>({feature,free_slot:true,completed:true})))).toBeNull();
  });
  it('allows resumed Free topics and all Pro topics in recommendations', () => {
    expect(recommendedTopic(HUB_TOPICS.map(emptyTopic), {}, false, [{feature:'signs',free_slot:true,completed:false}])).toBe('signs');
    expect(recommendedTopic(HUB_TOPICS.map(emptyTopic), {}, true, [{feature:'signs',free_slot:true,completed:true}])).toBe('signs');
  });
  it('shows no review restriction for zero misses and locks only positive Free misses', () => {
    expect(missedReviewState(false,0)).toBe('empty');
    expect(missedReviewState(false,1)).toBe('locked');
    expect(missedReviewState(true,1)).toBe('available');
  });
  it('upgrades legacy binary misses without losing mastery, miss counts or recovery', () => {
    const legacy = { q: 'It is important to keep the inside and outside of your windshield clean.', options: ['True','False'], correct: 0, explanation: 'True. Sun glare and headlight scatter turn dirty glass into a visibility hazard.', topic: 'signs' as const, key: 'legacy' };
    const normalized = normalizeTopicProgress({ ...emptyTopic('signs'), questions: { legacy: { question: legacy, correct: true, everCorrect: true, missed: true, recovery: 1, missedCount: 3, lastMissedAt: '2026-11-20T10:00:00Z' } } });
    const question = missedQuestions([normalized])[0];
    expect(question?.options).toHaveLength(3);
    expect(question?.conceptId).toBe('windshield');
    if (!question) throw new Error('Missed question missing');
    expect(normalized.questions[question.key]).toMatchObject({ everCorrect: true, recovery: 1, missedCount: 3, lastMissedAt: '2026-11-20T10:00:00Z' });
    expect(missedQuestions([answerProgress(normalized, question, true)])).toHaveLength(0);
    expect(topicStats(normalized, 1).mastery).toBe(100);
  });
  it("merges identical text with older different choices into one missed entry", () => {
    const alternate = hubQuestion({...question,options:['Stop completely','Keep driving']},'signs');
    const normalized = normalizeTopicProgress({...emptyTopic('signs'),questions:{[question.key]:{question,correct:false,missed:true,recovery:0},[alternate.key]:{question:alternate,correct:false,missed:true,recovery:0}}});
    expect(Object.keys(normalized.questions)).toHaveLength(1);
    expect(missedQuestions([normalized])).toHaveLength(1);
  });
  it("merges identical legacy text without a concept ID into the current canonical question", () => {
    const current = hubQuestion({...question,conceptId:'stop-light'},'signs');
    const normalized = normalizeTopicProgress({...emptyTopic('signs'),questions:{[question.key]:{question,correct:false,missed:true,recovery:0},[current.key]:{question:current,correct:true,everCorrect:true,missed:false,recovery:0}}});
    expect(Object.keys(normalized.questions)).toEqual([current.key]);
    expect(missedQuestions([normalized])).toHaveLength(0);
    expect(Object.values(normalized.questions)[0]?.everCorrect).toBe(true);
  });
  it("updates the same missed ID once, counting misses and retaining the latest missed date", () => {
    const first = answerProgress(emptyTopic('signs'),question,false,'2026-11-20T10:00:00Z');
    const second = answerProgress(first,question,false,'2026-11-23T10:00:00Z');
    expect(missedQuestions([second])).toHaveLength(1);
    expect(second.questions[question.key]).toMatchObject({missedCount:2,lastMissedAt:'2026-11-23T10:00:00Z'});
    const correct = answerProgress(second,question,true,'2026-11-23T11:00:00Z');
    expect(correct.questions[question.key]).toMatchObject({missedCount:2,lastMissedAt:'2026-11-23T10:00:00Z'});
  });
  it("consolidates legacy duplicate IDs while preserving canonical recovered status and mastery", () => {
    const canonical = hubQuestion({...question,conceptId:'flashing-yellow'},'signs');
    const alias = {...canonical,conceptId:'TEMPLATES-006',key:'old-key'};
    const recovered = {...canonical,conceptId:'railroad-flashing-red'};
    const normalized = normalizeTopicProgress({...emptyTopic('signs'),questions:{'old-key':{question:alias,correct:false,missed:true,recovery:0,missedCount:2},[hubQuestion(recovered,'signs').key]:{question:recovered,correct:true,everCorrect:true,missed:false,recovery:0,missedCount:1}}});
    expect(Object.keys(normalized.questions)).toHaveLength(1);
    expect(missedQuestions([normalized])).toHaveLength(0);
    expect(Object.values(normalized.questions)[0]).toMatchObject({everCorrect:true,missedCount:2});
  });
  it("does not label an unattempted topic as needing work", () => {
    expect(topicStats(emptyTopic("signs"), 8)).toMatchObject({ practiced: false, needsWork: false });
  });
  it("keeps a miss until two correct answers, resetting recovery on another miss", () => {
    const missed = answerProgress(emptyTopic("signs"), question, false);
    const once = answerProgress(missed, question, true);
    expect(missedQuestions([once])).toHaveLength(1);
    expect(missedQuestions([answerProgress(once, question, true)])).toHaveLength(0);
    const wrongAgain = answerProgress(once, question, false);
    expect(missedQuestions([answerProgress(wrongAgain, question, true)])).toHaveLength(1);
  });
  it("computes mastery from ever-correct answers and flags below 80%, mastering at 100%", () => {
    let progress = emptyTopic("signs");
    for (let i = 0; i < 5; i++) progress = answerProgress(progress, { ...question, key: String(i) }, i < 3);
    expect(topicStats(progress)).toMatchObject({ mastery: 60, needsWork: true, mastered: false });
    progress = answerProgress(progress, { ...question, key: "3" }, true);
    expect(topicStats(progress)).toMatchObject({ mastery: 80, needsWork: false });
    progress = answerProgress(progress, { ...question, key: "4" }, true);
    expect(topicStats(progress)).toMatchObject({ mastery: 100, mastered: true });
  });
  it("uses all topic questions, including unattempted ones, as the mastery denominator", () => {
    const progress = answerProgress(emptyTopic("signs"), question, true);
    expect(topicStats(progress, 8).mastery).toBe(13);
    expect(topicStats(emptyTopic("signs"), 8)).toMatchObject({ mastery: 0, lastScore: null });
  });
  it("lowers mastery when a previously correct question is currently wrong", () => {
    const first = answerProgress(emptyTopic("signs"), question, true);
    const later = answerProgress(first, question, false);
    expect(topicStats(later, 1).mastery).toBe(0);
    expect(later.questions[question.key]?.correct).toBe(false);
    expect(missedQuestions([later])).toHaveLength(1);
  });
  it("never inflates current mastery to a historical best score", () => {
    const progress = { ...answerProgress(emptyTopic("signs"), question, false), bestScore: 100, lastScore: 13 };
    expect(topicStats(progress, 24).mastery).toBe(0);
    const withoutBest = answerProgress(emptyTopic("signs"), question, true);
    expect(topicStats(withoutBest, 24).mastery).toBe(4);
  });
  it("recommends the weakest topic", () => {
    expect(weakestTopic([answerProgress(emptyTopic("signs"), question, true), emptyTopic("speed")])).toBe("speed");
  });
  it("permits one free attempt per topic and unlimited Pro attempts", () => {
    expect(mayAnswerHub(false, 0)).toBe(true);
    expect(mayAnswerHub(false, 1)).toBe(false);
    expect(mayAnswerHub(true, 100)).toBe(true);
  });
  it("retains identity across shuffled positions and distinguishes sign images", () => {
    expect(hubQuestion({ ...question, options: ["Go", "Stop"], correct: 1 }, "signs").key).toBe(question.key);
    expect(hubQuestion({ ...question, sign: { shape: "octagon", letters: "STOP", fill: "var(--exam-road-red)", stroke: "var(--exam-road-white)" } }, "signs").key).not.toBe(question.key);
    expect(question.q).toBe("What does a red light mean?");
  });
  it("preserves last score independently of live mastery without showing 100% after a low score", () => {
    const progress = answerProgress({ ...emptyTopic("signs"), lastScore: 75 }, question, true);
    expect(topicStats(progress, 2)).toMatchObject({ mastery: 50, lastScore: 75, practiced: true });
  });
  it("counts only unique current-bank misses in totals and review", () => {
    const current = hubQuestion({...question, conceptId:'current-sign'}, 'signs');
    const retired = hubQuestion({q:'What is the adult-only rule?',options:['A','B'],correct:0,explanation:'Retired.',conceptId:'retired-adult'}, 'signs');
    const progress = [answerProgress(answerProgress(emptyTopic('signs'), current, false), retired, false)];
    expect(missedQuestions(progress)).toHaveLength(2);
    expect(missedQuestions(progress, [current])).toEqual([current]);
  });
});