import type { PillarId, PracticeQuestion } from "@/data/dmv/practice-bank";
import { directQuestion } from "./mock-exam";
import { canonicalConcept } from "@/data/dmv/question-concepts";
import { questionIdentityKeys } from "./question-session";

export const HUB_TOPICS: PillarId[] = ["signs", "intersections", "substances", "speed"];
export const HUB_FREE_LIMIT = 1;
export type HubQuestion = PracticeQuestion & { topic: PillarId; key: string };
export type QuestionProgress = { question: HubQuestion; correct: boolean; everCorrect?: boolean; missed: boolean; recovery: number; missedCount?: number; lastMissedAt?: string | null; lastAnsweredAt?: string | null };
export type TopicProgress = { topic: PillarId; questions: Record<string, QuestionProgress>; lastScore: number | null; bestScore?: number | null };

export function hubQuestion(question: PracticeQuestion, topic: PillarId): HubQuestion {
  const q = directQuestion(question.q)
    .replace(/^(?:During your morning drive|While driving home from school|While driving|On your way to school|During your commute),\s*/i, "");
  const text = q.charAt(0).toUpperCase() + q.slice(1);
  // Sorting options is for identity only; displayed order/scoring stay intact.
  const key = question.conceptId ? JSON.stringify([topic, canonicalConcept(question.conceptId)]) : JSON.stringify([topic, text, question.sign ?? null, [...question.options].sort()]);
  return { ...question, q: text, topic, key };
}

export function emptyTopic(topic: PillarId): TopicProgress {
  return { topic, questions: {}, lastScore: null };
}

export function answerProgress(progress: TopicProgress, question: HubQuestion, correct: boolean, answeredAt = new Date().toISOString()): TopicProgress {
  const previous = progress.questions[question.key];
  const recovery = correct && previous?.missed ? previous.recovery + 1 : 0;
  const missed = !correct || (previous?.missed === true && recovery < 2);
  return { ...progress, questions: { ...progress.questions, [question.key]: {
    question, correct, everCorrect: correct || (previous?.everCorrect ?? previous?.correct ?? false), missed, recovery: missed ? recovery : 0,
    missedCount: (previous?.missedCount ?? (previous?.missed ? 1 : 0)) + (correct ? 0 : 1),
    lastMissedAt: correct ? previous?.lastMissedAt ?? null : answeredAt,
    lastAnsweredAt: answeredAt,
  } } };
}

export function topicStats(progress: TopicProgress, totalQuestions = Object.keys(progress.questions).length) {
  const entries = Object.values(progress.questions);
  const everCorrect = totalQuestions ? Math.min(100, Math.round(entries.filter(q => q.everCorrect ?? q.correct).length / totalQuestions * 100)) : 0;
  // Mastery never drops below the user's best score for the topic.
  const mastery = Math.max(everCorrect, progress.bestScore ?? 0);
  const practiced = entries.length > 0 || progress.lastScore !== null;
  return { mastery, practiced, needsWork: practiced && mastery < 80, mastered: mastery === 100, lastScore: progress.lastScore };
}

export function weakestTopic(progress: TopicProgress[], totals?: Partial<Record<PillarId, number>>): PillarId {
  return [...progress].sort((a, b) => topicStats(a, totals?.[a.topic]).mastery - topicStats(b, totals?.[b.topic]).mastery)[0]?.topic ?? "signs";
}

export function missedQuestions(progress: TopicProgress[]): HubQuestion[] {
  const seen = new Set<string>();
  return progress.flatMap(topic => Object.values(normalizeTopicProgress(topic).questions).filter(q => q.missed).map(q => q.question)).filter(question => {
    const keys = questionIdentityKeys(question);
    if(keys.some(key => seen.has(key))) return false;
    keys.forEach(key => seen.add(key)); return true;
  });
}

/** Consolidate legacy phrasing keys without resurrecting recovered misses. */
export function normalizeTopicProgress(progress: TopicProgress): TopicProgress {
  const questions: TopicProgress['questions'] = {};
  const fallbackKeys = new Map<string,string>();
  const signature = (question: HubQuestion) => JSON.stringify([hubQuestion(question,progress.topic).q.toLowerCase(),question.sign ?? null]);
  const concepts = new Map<string,string>();
  for (const entry of Object.values(progress.questions).sort((a,b) => hubQuestion(a.question,progress.topic).key.localeCompare(hubQuestion(b.question,progress.topic).key))) {
    if(!fallbackKeys.has(signature(entry.question))) fallbackKeys.set(signature(entry.question),hubQuestion(entry.question,progress.topic).key);
    if(entry.question.conceptId && !concepts.has(signature(entry.question))) concepts.set(signature(entry.question),canonicalConcept(entry.question.conceptId));
  }
  const canonical = (question: HubQuestion) => {
    const conceptId = concepts.get(signature(question));
    const current = hubQuestion(conceptId ? {...question,conceptId} : question,progress.topic);
    return conceptId ? current : {...current,key:fallbackKeys.get(signature(question)) ?? current.key};
  };
  const entries = Object.entries(progress.questions).sort(([ak,a],[bk,b]) => {
    const time = (Date.parse(a.lastAnsweredAt ?? '') || 0) - (Date.parse(b.lastAnsweredAt ?? '') || 0);
    return time || Number(ak === canonical(a.question).key) - Number(bk === canonical(b.question).key);
  });
  for (const [,entry] of entries) {
    const question = canonical(entry.question);
    const previous = questions[question.key];
    questions[question.key] = {...entry,question,everCorrect:(entry.everCorrect ?? entry.correct) || (previous?.everCorrect ?? previous?.correct ?? false),missedCount:Math.max(entry.missedCount ?? (entry.missed ? 1 : 0),previous?.missedCount ?? 0),lastMissedAt:[entry.lastMissedAt,previous?.lastMissedAt].filter((value): value is string => Boolean(value)).sort().at(-1) ?? null};
  }
  return {...progress,questions};
}

export function mayAnswerHub(isPro: boolean, used: number): boolean {
  return isPro || used < HUB_FREE_LIMIT;
}