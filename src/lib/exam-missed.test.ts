import { expect, it } from 'vitest';
import { withHistoricalExamAnswers } from './exam-missed';
import { missedQuestions, answerProgress, emptyTopic, hubQuestion } from './test-hub';
import type { StudyAttempt } from './study-attempt';
const q = { q: 'What does a red light mean?', topic: 'signs' as const, options: ['Stop','Go'], correct: 0, explanation: 'Stop.' };
const attempt: StudyAttempt = { id:'a', feature:'exam', state:'California', free_slot:true, payload:[q,{...q,q:'What does a green light mean?',correct:1}], answers:[1,1], completed:true,score:50,average_reaction:null,version:2,created_at:'2026-11-01' };
it('includes precisely the wrong saved exam answers in review',()=>{
  expect(missedQuestions(withHistoricalExamAnswers([], [attempt]).map(r=>r.progress))).toHaveLength(1);
});
it('does not bring back a historical miss recovered twice',()=>{
  const question=hubQuestion(q,'signs');
  let progress=answerProgress(emptyTopic('signs'),question,false);
  progress=answerProgress(answerProgress(progress,question,true),question,true);
  expect(missedQuestions(withHistoricalExamAnswers([{state:'California',progress}],[attempt]).map(r=>r.progress))).toHaveLength(0);
});