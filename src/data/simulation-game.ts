export const DECISION_MS = 2_500;

export type ScenarioDecision = {
  scenarioId: string;
  selectedAction: string | null;
  correct: boolean;
  reactionMs: number | null;
  thumbnail: string | null;
  steps?: ScenarioDecision[];
};

export function recordDecision(scenarioId: string, selectedAction: string | null, correctAction: string, elapsedMs: number, timed: boolean, thumbnail: string | null = null): ScenarioDecision {
  const timedOut = selectedAction === null || (timed && elapsedMs >= DECISION_MS);
  return {
    scenarioId,
    selectedAction: timedOut ? null : selectedAction,
    correct: !timedOut && selectedAction === correctAction,
    reactionMs: timedOut ? null : Math.max(0, elapsedMs),
    thumbnail,
  };
}

export function decisionSummary(decisions: readonly ScenarioDecision[]) {
  const times = decisions.flatMap((decision) => (decision.steps ?? [decision]).flatMap(step => step.reactionMs === null ? [] : [step.reactionMs]));
  return {
    accuracy: decisions.length ? Math.round(decisions.filter((decision) => decision.correct).length / decisions.length * 100) : 0,
    averageReaction: times.length ? times.reduce((a, b) => a + b, 0) / times.length / 1000 : null,
    completed: decisions.filter(decision => decision.selectedAction !== null).length,
    missed: decisions.filter((decision) => !decision.correct),
  };
}

export function stepProgress(required: readonly string[], recorded: readonly ScenarioDecision[]) {
  const last = recorded.at(-1);
  return last?.correct === true && recorded.length < required.length ? "next" : "finished";
}

export function finishScenario(required: readonly string[], steps: ScenarioDecision[]): ScenarioDecision {
  const first = steps[0];
  if (!first) throw new Error("A scenario needs at least one decision");
  const times = steps.flatMap(step => step.reactionMs === null ? [] : [step.reactionMs]);
  return { ...first, selectedAction: steps.some(step => step.selectedAction === null) ? null : steps.at(-1)?.selectedAction ?? null,
    correct: steps.length === required.length && steps.every((step, index) => step.correct && step.selectedAction === required[index]),
    reactionMs: times.length ? times.reduce((a, b) => a + b, 0) / times.length : null, steps };
}