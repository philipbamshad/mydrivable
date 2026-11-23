import type { PracticeQuestion } from "@/data/dmv/practice-bank";

export const DEMO_TABS = ["practice", "signs", "coach", "simulation", "progress"] as const;
export type DemoTab = typeof DEMO_TABS[number];
export type ScoredDemoTab = Exclude<DemoTab, "progress">;
export const DEMO_COMPLETION_KEY = "drivable-demo-completed-v1";
export function completedDemoTabs(raw: string | null): DemoTab[] {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(value) ? DEMO_TABS.filter(tab => value.includes(tab)) : [];
  } catch { return []; }
}
export function demoResults<Q extends PracticeQuestion>(questions: readonly Q[], answers: readonly number[]) {
  return {
    correct: questions.filter((q, index) => answers[index] === q.correct).length,
    total: questions.length,
    missed: questions.flatMap((question, index) => answers[index] === question.correct ? [] : [{ question, chosen: answers[index] }]),
  };
}
export function untriedDemoTabs(completed: readonly DemoTab[], current: DemoTab): DemoTab[] {
  return DEMO_TABS.filter(tab => tab !== current && !completed.includes(tab));
}
/** Progress built only from answers saved in this browser for completed demo tabs. */
export function demoProgress(banks: Record<ScoredDemoTab, readonly (PracticeQuestion & { topic: string })[]>, records: Partial<Record<DemoTab, readonly number[]>>, completed: readonly DemoTab[]) {
  const tabs = (Object.keys(banks) as ScoredDemoTab[]).filter(tab => completed.includes(tab) && records[tab]);
  let correct = 0, total = 0; const topics: string[] = [];
  const scores = tabs.map(tab => {
    const r = demoResults(banks[tab], records[tab] ?? []);
    correct += r.correct; total += r.total;
    for (const m of r.missed) { const t = m.question.topic; if (!topics.includes(t)) topics.push(t); }
    return { tab, correct: r.correct, total: r.total, percent: r.total ? Math.round(r.correct / r.total * 100) : 0 };
  });
  return { accuracy: total ? Math.round(correct / total * 100) : null, correct, total, scores, topics };
}
