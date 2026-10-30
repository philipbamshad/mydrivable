import { describe, it, expect } from "vitest";
import { answerProgress, emptyTopic, hubQuestion, topicStats, weakestTopic, missedQuestions, mayAnswerHub } from "./test-hub";

const question = hubQuestion({ q: "During your morning drive, what does a red light mean?", options: ["Stop", "Go"], correct: 0, explanation: "Stop at the limit line." }, "signs");
describe("Permit Test Hub rules", () => {
  it("keeps a miss until two correct answers, resetting recovery on another miss", () => {
    const missed = answerProgress(emptyTopic("signs"), question, false);
    const once = answerProgress(missed, question, true);
    expect(missedQuestions([once])).toHaveLength(1);
    expect(missedQuestions([answerProgress(once, question, true)])).toHaveLength(0);
    const wrongAgain = answerProgress(once, question, false);
    expect(missedQuestions([answerProgress(wrongAgain, question, true)])).toHaveLength(1);
  });
  it("computes mastery from latest answers and flags below 80%, mastering at 100%", () => {
    let progress = emptyTopic("signs");
    for (let i = 0; i < 5; i++) progress = answerProgress(progress, { ...question, key: String(i) }, i < 3);
    expect(topicStats(progress)).toMatchObject({ mastery: 60, needsWork: true, mastered: false });
    progress = answerProgress(progress, { ...question, key: "3" }, true);
    expect(topicStats(progress)).toMatchObject({ mastery: 80, needsWork: false });
    progress = answerProgress(progress, { ...question, key: "4" }, true);
    expect(topicStats(progress)).toMatchObject({ mastery: 100, mastered: true });
  });
  it("recommends the weakest topic", () => {
    expect(weakestTopic([answerProgress(emptyTopic("signs"), question, true), emptyTopic("speed")])).toBe("speed");
  });
  it("retains the 10 lifetime questions per section in review and regular practice", () => {
    expect(mayAnswerHub(false, 9)).toBe(true);
    expect(mayAnswerHub(false, 10)).toBe(false);
    expect(mayAnswerHub(true, 10)).toBe(true);
  });
  it("retains identity across shuffled positions and distinguishes sign images", () => {
    expect(hubQuestion({ ...question, options: ["Go", "Stop"], correct: 1 }, "signs").key).toBe(question.key);
    expect(hubQuestion({ ...question, sign: { shape: "octagon", letters: "STOP" } }, "signs").key).not.toBe(question.key);
    expect(question.q).toBe("What does a red light mean?");
  });
  it("preserves last score independently of live mastery", () => {
    const progress = answerProgress({ ...emptyTopic("signs"), lastScore: 75 }, question, true);
    expect(topicStats(progress)).toMatchObject({ mastery: 100, lastScore: 75, practiced: true });
  });
});