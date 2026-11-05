import type { ExamQuestion } from './mock-exam';
import type { HubQuestion } from './test-hub';
import type { SimulationClip } from '@/data/simulation-session';
import type { ScenarioDecision } from '@/data/simulation-game';

export type StudyFeature = 'exam' | 'signs' | 'intersections' | 'substances' | 'speed' | 'simulation' | 'review';
export type StudyAttempt = {
  id: string; feature: StudyFeature; state: string; free_slot: boolean;
  payload: (ExamQuestion | HubQuestion | SimulationClip)[];
  answers: (number | ScenarioDecision)[]; completed: boolean; score: number | null;
  average_reaction: number | null; version: number; created_at: string;
};
export const ATTEMPT_LOCK_MESSAGE = "You've used your free attempt. Upgrade to Pro for unlimited practice.";
export const DAILY_AI_MESSAGE = "You've used your 5 free questions today. They reset at midnight, or upgrade to Pro for unlimited questions.";
export function attemptAccess(isPro: boolean, attempt?: Pick<StudyAttempt, 'completed'>) {
  return isPro ? 'start' : !attempt ? 'start' : attempt.completed ? 'locked' : 'resume';
}
export function simulationHistoryStats(attempts: StudyAttempt[]) {
  const rows = attempts.filter(a => a.feature === 'simulation' && a.completed).sort((a,b) => b.created_at.localeCompare(a.created_at));
  return { best: rows.length ? Math.max(...rows.map(a => a.score ?? 0)) : null, reaction: rows[0]?.average_reaction ?? null };
}