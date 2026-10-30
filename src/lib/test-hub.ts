import type { PillarId, PracticeQuestion } from "@/data/dmv/practice-bank";
import { directQuestion } from "./mock-exam";

export const HUB_TOPICS: PillarId[] = ["signs", "intersections", "substances", "speed"];
export const HUB_FREE_LIMIT = 10;
export type HubQuestion = PracticeQuestion & { topic: PillarId; key: string };
export type QuestionProgress = { question: HubQuestion; correct: boolean; missed: boolean; recovery: number };
export type TopicProgress = { topic: PillarId; questions: Record<string, QuestionProgress>; lastScore: number | null };

export function hubQuestion(question: PracticeQuestion, topic: PillarId): HubQuestion {
  const q = directQuestion(question.q)
    .replace(/^(?:During your morning drive|While driving home from school|While driving|On your way to school|During your commute),\s*/i, "");
  const text = q.charAt(0).toUpperCase() + q.slice(1);
  // Sorting options is for identity only; displayed order/scoring stay intact.
  const key = JSON.stringify([topic, text, question.sign ?? null, [...question.options].sort()]);
  return { ...question, q: text, topic, key };
}

export function emptyTopic(topic: PillarId): TopicProgress {
  return { topic, questions: {}, lastScore: null };
}

export function answerProgress(progress: TopicProgress, question: HubQuestion, correct: boolean): TopicProgress {
  const previous = progress.questions[question.key];
  const recovery = correct && previous?.missed ? previous.recovery + 1 : 0;
  const missed = !correct || (previous?.missed === true && recovery < 2);
  return { ...progress, questions: { ...progress.questions, [question.key]: {
    question, correct, missed, recovery: missed ? recovery : 0,
  } } };
}

export function topicStats(progress: TopicProgress) {
  const entries = Object.values(progress.questions);
  const mastery = entries.length ? Math.round(entries.filter(q => q.correct).length / entries.length * 100) : 0;
  return { mastery, practiced: entries.length > 0, needsWork: mastery < 80, mastered: mastery === 100, lastScore: progress.lastScore };
}

export function weakestTopic(progress: TopicProgress[]): PillarId {
  return [...progress].sort((a, b) => topicStats(a).mastery - topicStats(b).mastery)[0]?.topic ?? "signs";
}

export function missedQuestions(progress: TopicProgress[]): HubQuestion[] {
  return progress.flatMap(topic => Object.values(topic.questions).filter(q => q.missed).map(q => q.question));
}

export function mayAnswerHub(isPro: boolean, used: number): boolean {
  return isPro || used < HUB_FREE_LIMIT;
}