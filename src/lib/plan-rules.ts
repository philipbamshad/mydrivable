export const FREE_TOPIC_QUESTIONS = 10;
export const FREE_EXAM_QUESTIONS = 15;
export const FREE_COACH_QUESTIONS = 3;
export function studyQuestionCount(isPro: boolean, feature: string, fullCount: number) {
  return isPro ? fullCount : feature === 'exam' ? FREE_EXAM_QUESTIONS : FREE_TOPIC_QUESTIONS;
}
export function isSampleExam(attempt: { feature: string; free_slot: boolean; payload: unknown[] }) {
  return attempt.feature === 'exam' && attempt.free_slot && attempt.payload.length === FREE_EXAM_QUESTIONS;
}
export function samplePassingCount(count: number, passingPct: number) {
  return Math.ceil(count * passingPct / 100);
}
export function studyPlanAllowed(isPro: boolean) { return isPro; }