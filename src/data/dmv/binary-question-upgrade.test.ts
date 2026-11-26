import { expect, it } from 'vitest';
import { BINARY_REPLACEMENTS, isBinaryQuestion, upgradeBinaryQuestion } from './binary-question-upgrade';
import { buildPillarBanks } from './practice-bank';
import { ALL_STATES } from './index';
import { DEMO_PRACTICE, DEMO_SIGNS, DEMO_COACH } from '@/lib/demo';

it('converts all 15 binary concepts without deleting any or changing explanations', () => {
  expect(BINARY_REPLACEMENTS).toHaveLength(15);
  for (const rule of BINARY_REPLACEMENTS) {
    for (const correct of [0, 1]) {
      const old = { conceptId: rule.conceptId, q: 'Legacy statement', options: ['True', 'False'], correct, explanation: rule.match };
      const upgraded = upgradeBinaryQuestion(old, 'California');
      expect(upgraded.options).toHaveLength(3);
      expect(upgraded.correct).toBe(correct);
      expect(upgraded.explanation).toBe(old.explanation);
      expect(upgraded.conceptId).toBe(old.conceptId);
      expect(isBinaryQuestion(upgraded)).toBe(false);
      expect(upgraded.q.endsWith('?')).toBe(true);
      expect(upgradeBinaryQuestion(upgraded, 'California')).toEqual(upgraded);
    }
  }
});

it('keeps both past correct and incorrect numeric answers valid after conversion', () => {
  const old = { q: 'Legacy statement', options: ['False', 'True'], correct: 1, explanation: 'Sun glare and headlight scatter make dirty glass hazardous.' };
  const upgraded = upgradeBinaryQuestion(old, 'Delaware');
  expect(upgraded.options[1]).toBe('To reduce glare and improve visibility');
  expect(upgraded.options[0]).not.toBe(upgraded.options[1]);
  expect(upgraded.correct).toBe(1);
  expect(upgraded.conceptId).toBe('windshield');
});

it('preserves state-specific numeric choices in legacy questions', () => {
  const old = { q: 'Legacy statement', options: ['True', 'False'], correct: 0, explanation: 'school zone limits are commonly lowered' };
  expect(upgradeBinaryQuestion(old, 'California').options[0]).toContain('25 mph');
  expect(upgradeBinaryQuestion(old, 'Delaware').options[0]).toContain('20 mph');
});

it('has no binary questions in any state/topic or demo bank', () => {
  for (const state of ALL_STATES) for (const question of Object.values(buildPillarBanks(state)).flat()) {
    expect(question.options.length, `${state}: ${question.q}`).toBeGreaterThanOrEqual(3);
    expect(isBinaryQuestion(question)).toBe(false);
  }
  for (const question of [...DEMO_PRACTICE, ...DEMO_SIGNS, DEMO_COACH]) {
    expect(question.options.length).toBeGreaterThanOrEqual(3);
    expect(isBinaryQuestion(question)).toBe(false);
  }
});