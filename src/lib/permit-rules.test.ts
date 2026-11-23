import { expect, it } from 'vitest';
import { permitRules } from './permit-rules';
it('uses 46 California questions for under-18 learners', () => {
  expect(permitRules('California', true).questionsCount).toBe(46);
  expect(permitRules('California', true).minCorrectToPass).toBe(38);
});
it('uses 36 California questions for adults', () => {
  expect(permitRules('California', false).questionsCount).toBe(36);
  expect(permitRules('California', false).minCorrectToPass).toBe(30);
});