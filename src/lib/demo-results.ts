import type { PracticeQuestion } from "@/data/dmv/practice-bank";

export const DEMO_TABS = ["practice", "signs", "coach", "simulation", "progress"] as const;
export type DemoTab = typeof DEMO_TABS[number];
export const DEMO_COMPLETION_KEY = "drivable-demo-completed-v1";
export function completedDemoTabs(raw: string | null): DemoTab[] {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(value) ? DEMO_TABS.filter(tab => value.includes(tab)) : [];
  } catch { return []; }
}
export function demoResults(questions: readonly PracticeQuestion[], answers: readonly number[]) {
  return {
    correct: questions.filter((q, index) => answers[index] === q.correct).length,
    total: questions.length,
    missed: questions.flatMap((question, index) => answers[index] === question.correct ? [] : [{ question, chosen: answers[index] }]),
  };
}
export function untriedDemoTabs(completed: readonly DemoTab[], current: DemoTab): DemoTab[] {
  return DEMO_TABS.filter(tab => tab !== current && !completed.includes(tab));
}