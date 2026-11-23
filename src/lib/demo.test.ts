import { expect, it } from 'vitest';
import { DEMO_POLICY, DEMO_PRACTICE, DEMO_SIGNS, DEMO_SCENARIO, setupReady } from './demo';
it('provides five real California practice questions', () => {
  expect(DEMO_PRACTICE).toHaveLength(5);
  for (const q of DEMO_PRACTICE) expect(q.options[q.correct]).toBeTruthy();
});
it('provides five distinct sign questions with existing visuals', () => {
  expect(DEMO_SIGNS).toHaveLength(5);
  expect(new Set(DEMO_SIGNS.map(q => JSON.stringify(q.sign))).size).toBe(5);
  for (const q of DEMO_SIGNS) expect(q.options[q.correct]).toBeTruthy();
});
it('offers one existing Stop scenario without saves, credits or live AI', () => {
  expect(DEMO_SCENARIO?.steps).toEqual(['stop']);
  expect(DEMO_SCENARIO?.pauseAt).toBe(1);
  expect(DEMO_POLICY).toEqual({ savesProgress: false, consumesUsage: false, liveAI: false });
});
it('requires saved state setup, not an age answer', () => {
  expect(setupReady('California', '2026-11-23')).toBe(true);
  expect(setupReady('', '2026-11-23')).toBe(false);
  expect(setupReady('California', null)).toBe(false);
});