import { getStatePack, type Question } from "@/data/dmv";
import { buildPillarBanks, type PillarId } from "@/data/dmv/practice-bank";
import type { SignSpec } from "@/components/dashboard/SignVisual";

export const EXAM_FREE_LIMIT = 20;
export const TOPICS: PillarId[] = ["signs", "intersections", "substances", "speed"];
export type ExamQuestion = Question & { topic: PillarId; sign?: SignSpec };
export type ExamHistoryRow = { id: string; score_pct: number; state: string | null; created_at: string };

export function directQuestion(text: string): string {
  let out = text.trim();
  const frames = [
    /^During your morning (?:drive|commute),\s*/i,
    /^While (?:preparing for your written test|driving home from school),\s*/i,
    /^Imagine you are behind the wheel\.\s*/i,
    /^You are driving (?:in [^.]+|on a public road)\.\s*/i,
    /^On (?:a [^,]+ road|a typical road),\s*/i,
    /^On a clear afternoon in [^,]+,\s*/i,
    /^Mid-storm on a rainy [^,]+ highway,\s*/i,
    /^At dusk on a quiet residential street,\s*/i,
  ];
  for (let i = 0; i < 4; i++) for (const frame of frames) out = out.replace(frame, "");
  return out.charAt(0).toUpperCase() + out.slice(1);
}

function inferTopic(q: string): PillarId {
  if (/sign|signal|light|marking|curb|yellow line|white line|sharrow/i.test(q)) return "signs";
  if (/alcohol|bac|drug|seat belt|child|phone|headset|collision|emergency|night|license|permit age/i.test(q)) return "substances";
  if (/right.of.way|intersection|pedestrian|turn|roundabout|crosswalk|yield/i.test(q)) return "intersections";
  return "speed";
}

export function buildExamPool(state: string): ExamQuestion[] {
  const banks = buildPillarBanks(state);
  const authored = new Map<string, ExamQuestion>();
  for (const topic of TOPICS) for (const q of banks[topic]) {
    const text = directQuestion(q.q);
    if (!authored.has(text)) authored.set(text, { ...q, q: text, topic });
  }
  for (const q of getStatePack(state).questions) {
    const text = directQuestion(q.q);
    if (!authored.has(text)) authored.set(text, { ...q, q: text, topic: inferTopic(text) });
  }
  return [...authored.values()];
}

export function examSummary(questions: ExamQuestion[], answers: (number | null)[], minCorrect: number) {
  const correct = questions.filter((q, index) => answers[index] === q.correct).length;
  return {
    correct,
    pct: questions.length ? Math.round(correct / questions.length * 100) : 0,
    passed: correct >= minCorrect,
    topics: TOPICS.map(topic => {
      const items = questions.map((q, index) => ({ q, index })).filter(item => item.q.topic === topic);
      const right = items.filter(item => answers[item.index] === item.q.correct).length;
      const pct = items.length ? Math.round(right / items.length * 100) : null;
      return { topic, total: items.length, correct: right, pct, needsWork: items.length > 0 && right / items.length < 0.8 };
    }),
  };
}

export function examHistoryStats(history: ExamHistoryRow[], state: string) {
  // Legacy rows did not store state; retain them rather than hiding existing attempts.
  const rows = history.filter(row => row.state === null || row.state === state).sort((a, b) => b.created_at.localeCompare(a.created_at));
  return { best: rows.length ? Math.max(...rows.map(row => row.score_pct)) : null, last: rows[0]?.score_pct ?? null, attempts: rows.length || null };
}

export function mayAnswerExam(isPro: boolean, used: number, previous: number | null): boolean {
  return isPro || previous !== null || used < EXAM_FREE_LIMIT;
}