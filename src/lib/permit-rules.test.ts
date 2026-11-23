import { expect, it } from 'vitest';
import { permitRules, studySetupReady } from './permit-rules';
it('uses 46 California questions for under-18 learners', () => {
  expect(permitRules('California', true).questionsCount).toBe(46);
  expect(permitRules('California', true).minCorrectToPass).toBe(38);
});
it('uses 36 California questions for adults', () => {
  expect(permitRules('California', false).questionsCount).toBe(36);
  expect(permitRules('California', false).minCorrectToPass).toBe(30);
});
it('new California learners without an age answer use the default exam',()=>{expect(permitRules('California',null).questionsCount).toBe(46);expect(permitRules('California',null).minCorrectToPass).toBe(38);});
it('setup requires saved state and completion, never an age answer',()=>{expect(studySetupReady('California',true)).toBe(true);expect(studySetupReady('',true)).toBe(false);expect(studySetupReady('California',false)).toBe(false);});
