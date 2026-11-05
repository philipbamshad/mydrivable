import type { ScenarioDecision } from "./simulation-game";

export type ResultChip = { action: string; mark: "check" | "cross" | "none"; tone: "success" | "destructive" };
export type ScenarioResultView = {
  heading: "Correct" | "Incorrect" | "No decision made";
  /** What the user chose (empty when the first step timed out). */
  chosen: (ResultChip & { reactionMs: number | null })[];
  /** Correct steps, shown unmarked; only present when the scenario was missed. Never carries a cross. */
  correctAnswer: ResultChip[] | null;
};

export function scenarioResultView(steps: string[], decision: ScenarioDecision): ScenarioResultView {
  const records = decision.steps ?? [decision];
  const last = records[records.length - 1];
  const timedOut = !decision.correct && (!last || last.selectedAction === null);
  const chosen = records.flatMap(r => r.selectedAction === null ? [] : [{
    action: r.selectedAction, mark: r.correct ? "check" as const : "cross" as const, tone: r.correct ? "success" as const : "destructive" as const, reactionMs: r.reactionMs,
  }]);
  return {
    heading: decision.correct ? "Correct" : timedOut ? "No decision made" : "Incorrect",
    chosen,
    correctAnswer: decision.correct ? null : steps.map(action => ({ action, mark: "none", tone: "success" })),
  };
}
