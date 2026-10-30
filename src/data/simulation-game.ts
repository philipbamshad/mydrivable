export const DECISION_MS = 5_000;

export type ScenarioDecision = {
  scenarioId: string;
  selectedAction: string | null;
  correct: boolean;
  reactionMs: number | null;
  thumbnail: string | null;
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
  const times = decisions.flatMap((decision) => decision.reactionMs === null ? [] : [decision.reactionMs]);
  return {
    accuracy: decisions.length ? Math.round(decisions.filter((decision) => decision.correct).length / decisions.length * 100) : 0,
    averageReaction: times.length ? times.reduce((a, b) => a + b, 0) / times.length / 1000 : null,
    completed: decisions.length,
    missed: decisions.filter((decision) => !decision.correct),
  };
}