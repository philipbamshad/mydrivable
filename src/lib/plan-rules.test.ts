import { describe, expect, it } from 'vitest';
import { studyQuestionCount, isSampleExam, samplePassingCount, FREE_COACH_QUESTIONS, studyPlanAllowed } from './plan-rules';
import { permitRules } from './permit-rules';
import { ALL_STATES } from '@/data/dmv';
describe('Free Pass and lifetime Pro', () => {
  it('gives Free exactly ten questions per topic', () => {
    for (const topic of ['signs','speed','intersections','substances']) expect(studyQuestionCount(false, topic, 80)).toBe(10);
  });
  it('gives Free a fifteen-question sample in every state, retaining Pro state lengths', () => {
    for (const state of ALL_STATES) {
      const count=permitRules(state,null).questionsCount;
      expect(studyQuestionCount(false,'exam',count)).toBe(15);
      expect(studyQuestionCount(true,'exam',count)).toBe(count);
    }
  });
  it('identifies new samples without relabeling saved full exams', () => {
    expect(isSampleExam({feature:'exam',free_slot:true,payload:Array(15)})).toBe(true);
    expect(isSampleExam({feature:'exam',free_slot:true,payload:Array(46)})).toBe(false);
    expect(isSampleExam({feature:'exam',free_slot:false,payload:Array(15)})).toBe(false);
  });
  it('allows three daily Coach questions', () => { expect(FREE_COACH_QUESTIONS).toBe(3); });
  it('keeps paid topic practice unrestricted to the complete bank', () => { expect(studyQuestionCount(true,'signs',88)).toBe(88); });
  it('scales only sample pass indicators', () => { expect(samplePassingCount(15,83)).toBe(13); });
  it('restricts the test-date study plan to Pro', () => { expect(studyPlanAllowed(false)).toBe(false);expect(studyPlanAllowed(true)).toBe(true); });
});