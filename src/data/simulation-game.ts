export const DECISION_MS = 4_000;
export const FEEDBACK_MS = 6_000;
export const INITIAL_LIVES = 3;

export type DriveStats = {
  score: number;
  lives: number;
  streak: number;
  bestStreak: number;
  correct: number;
  attempted: number;
  reactionTimes: number[];
};

export function initialDriveStats(): DriveStats {
  return { score: 0, lives: INITIAL_LIVES, streak: 0, bestStreak: 0, correct: 0, attempted: 0, reactionTimes: [] };
}

export function recordDecision(stats: DriveStats, correct: boolean, reactionMs: number | null) {
  const inTime = reactionMs !== null && reactionMs < DECISION_MS;
  const success = correct && inTime;
  const streak = success ? stats.streak + 1 : 0;
  const speedBonus = success ? Math.round(100 * (1 - Math.max(0, reactionMs ?? DECISION_MS) / DECISION_MS)) : 0;
  const points = success ? 100 + speedBonus + (streak % 3 === 0 ? 50 : 0) : 0;
  return {
    points,
    stats: {
      score: stats.score + points,
      lives: success ? stats.lives : Math.max(0, stats.lives - 1),
      streak,
      bestStreak: Math.max(stats.bestStreak, streak),
      correct: stats.correct + (success ? 1 : 0),
      attempted: stats.attempted + 1,
      reactionTimes: inTime ? [...stats.reactionTimes, Math.max(0, reactionMs)] : [...stats.reactionTimes],
    },
  };
}

export function driveSummary(stats: DriveStats) {
  return {
    accuracy: stats.attempted ? Math.round(stats.correct / stats.attempted * 100) : 0,
    averageReaction: stats.reactionTimes.length ? stats.reactionTimes.reduce((a, b) => a + b, 0) / stats.reactionTimes.length / 1000 : null,
  };
}