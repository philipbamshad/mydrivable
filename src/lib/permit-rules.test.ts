import { expect, it } from 'vitest';
import { permitRules } from './permit-rules';

it('always uses the California under-18 format', () => {
  expect(permitRules('California').questionsCount).toBe(46);
  expect(permitRules('California').minCorrectToPass).toBe(38);
  expect(permitRules('California').passingScorePct).toBe(83);
});
