import { expect, it } from 'vitest';
import { DEMO_COACH, DEMO_POLICY, DEMO_PRACTICE, DEMO_SCENARIOS, DEMO_SIGNS, setupReady } from './demo';
import { demoProgress } from './demo-results';
import { getStatePack } from '@/data/dmv';
it('provides five state-neutral practice questions', () => {
  expect(DEMO_PRACTICE).toHaveLength(5);
  const text = JSON.stringify([...DEMO_PRACTICE, ...DEMO_SIGNS, DEMO_COACH]);
  expect(text).not.toMatch(/California/i);
  expect(text).not.toMatch(/\d+\s*mph/i);
  for (const q of DEMO_PRACTICE) expect(q.options[q.correct]).toBeTruthy();
});
it('provides five distinct sign questions with existing visuals', () => {
  expect(DEMO_SIGNS).toHaveLength(5);
  expect(new Set(DEMO_SIGNS.map(q => JSON.stringify(q.sign))).size).toBe(5);
});
it('runs the three requested simulation scenarios with Go, Stop, Yield', () => {
  expect(DEMO_SCENARIOS.map(s => [s.clip.id, s.correct])).toEqual([['left-turn-green-arrow','go'],['no-turn-on-red','stop'],['left-turn-solid-green','yield']]);
  expect(DEMO_POLICY).toEqual({ savesProgress: false, consumesUsage: false, liveAI: false });
});
it('coach demo has one question with three options and a varied correct position', () => {
  expect(DEMO_COACH.options).toHaveLength(3);
  expect(DEMO_COACH.correct).toBe(2);
});
it('asks for actions at worded signs instead of repeating their lettering', () => {
  const stop = DEMO_SIGNS.find(q => q.sign?.letters === 'STOP');
  const entry = DEMO_SIGNS.find(q => q.sign?.letters === 'DO NOT ENTER');
  expect(stop?.options).not.toContain('Stop completely');
  expect(entry?.options).not.toContain('Do not enter this road');
  expect(stop?.q).toContain('What must you do');
  expect(entry?.q).toContain('What must you do');
});
it('progress reflects only completed demo answers and lists missed topics', () => {
  const banks = { practice: DEMO_PRACTICE, signs: DEMO_SIGNS, coach: [DEMO_COACH], simulation: [] };
  const empty = demoProgress(banks, {}, []);
  expect(empty.accuracy).toBeNull();
  const answers = DEMO_PRACTICE.map((q, i) => i === 0 ? (q.correct + 1) % q.options.length : q.correct);
  const p = demoProgress(banks, { practice: answers, coach: [DEMO_COACH.correct] }, ['practice', 'coach']);
  expect(p.correct).toBe(5); expect(p.total).toBe(6); expect(p.accuracy).toBe(83);
  expect(p.topics).toEqual(['Right of way']);
});
it('requires saved state setup, not an age answer', () => {
  expect(getStatePack('California')).toBeTruthy();
  expect(setupReady('California', '2026-11-23')).toBe(true);
  expect(setupReady('', '2026-11-23')).toBe(false);
});
