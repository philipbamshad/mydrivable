import { createServerFn } from '@tanstack/react-start';
import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { requireAllowlisted } from './allowlist-middleware';
import { getStatePack } from '@/data/dmv';
import { buildExamPool, type ExamQuestion } from './mock-exam';
import { buildPillarBanks } from '@/data/dmv/practice-bank';
import { shuffleAnswers } from '@/data/dmv/question-generator';
import { hubQuestion, missedQuestions, type HubQuestion, type TopicProgress } from './test-hub';
import { createSimulationSession, type SimulationClip } from '@/data/simulation-session';
import { SIMULATION_CLIPS } from '@/data/simulation-clips';
import { decisionSummary, finishScenario, recordDecision, stepProgress, type ScenarioDecision } from '@/data/simulation-game';
import type { StudyAttempt } from './study-attempt';
import { uniqueQuestionSession } from './question-session';
import { permitRules } from './permit-rules';
import { withHistoricalExamAnswers } from './exam-missed';
export type StudyAnswerInput = {id:string;version:number;answer?:number;steps?:{action:'go'|'yield'|'stop'|null;elapsed:number}[];timed?:boolean};

const feature = z.enum(['exam','signs','intersections','substances','speed','simulation','review']);
function asAttempt(row: unknown): StudyAttempt { return row as StudyAttempt; }
export const getStudyAttempts = createServerFn({method:'GET'}).middleware([requireAllowlisted]).handler(async ({context}) => {
  const {data,error} = await context.supabase.from('study_attempts').select('*').eq('user_id',context.userId).order('created_at',{ascending:false});
  if(error) throw new Error('Unable to load saved attempts.');
  return (data ?? []).map(asAttempt);
});
export const studyAttemptsOptions = (userId: string) => queryOptions({queryKey:['study-attempts',userId],queryFn:()=>getStudyAttempts()});
export const startStudyAttempt = createServerFn({method:'POST'}).middleware([requireAllowlisted])
  .inputValidator((input:unknown)=>z.object({feature}).parse(input))
  .handler(async ({context,data}) => {
    const {data:profile,error:profileError} = await context.supabase.from('user_profiles').select('active_state,under_18,onboarding_completed_at').eq('user_id',context.userId).single();
    if(profileError || !profile.active_state || profile.under_18 === null || !profile.onboarding_completed_at) throw new Error('Complete your setup before practicing.');
    const state = profile.active_state;
    let payload: unknown[];
    if(data.feature==='simulation') payload=createSimulationSession(SIMULATION_CLIPS);
    else if(data.feature==='exam') payload=uniqueQuestionSession(buildExamPool(state),permitRules(state,profile.under_18).questionsCount).map(q=>shuffleAnswers(q));
    else if(data.feature==='review') {
      const {data:pro,error:proError}=await context.supabase.rpc('has_pro_access',{p_user:context.userId});
      if(proError || !pro) throw new Error('Review missed questions is Pro only.');
      const {data:rows,error}=await context.supabase.from('test_hub_progress').select('*').eq('user_id',context.userId).eq('state',state);
      if(error) throw new Error('Unable to load missed questions.');
      const {data:exams,error:examError}=await context.supabase.from('study_attempts').select('*').eq('user_id',context.userId).eq('feature','exam').eq('state',state);
      if(examError) throw new Error('Unable to load missed exam questions.');
      const merged=withHistoricalExamAnswers((rows??[]).map(r=>({state:r.state,progress:{topic:r.topic,questions:r.questions,lastScore:r.last_score} as unknown as TopicProgress})),(exams??[]) as unknown as StudyAttempt[]);
      const missed=missedQuestions(merged.map(r=>r.progress));
      payload=uniqueQuestionSession(missed,missed.length).map(q=>shuffleAnswers(q));
    } else payload=uniqueQuestionSession(buildPillarBanks(state)[data.feature],8).map(q=>shuffleAnswers(hubQuestion(q,data.feature as HubQuestion['topic'])));
    if(!payload.length) throw new Error('No questions available to review.');
    const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
    const {data:row,error}=await supabaseAdmin.rpc('reserve_study_attempt',{p_user:context.userId,p_feature:data.feature,p_state:state,p_payload:JSON.parse(JSON.stringify(payload))});
    if(error) throw new Error('Unable to reserve your attempt. Please try again.');
    return asAttempt(row);
  });
export const answerStudyAttempt=createServerFn({method:'POST'}).middleware([requireAllowlisted])
  .inputValidator((input:unknown)=>z.object({id:z.string().uuid(),version:z.number().int().nonnegative(),answer:z.number().int().min(0).max(3).optional(),steps:z.array(z.object({action:z.enum(['go','yield','stop']).nullable(),elapsed:z.number().min(0).max(86400000)})).min(1).max(2).optional(),timed:z.boolean().optional()}).parse(input))
  .handler(async({data,context})=>{
    const {commitAnswer}=await import('./study-answer.server');
    return commitAnswer(data,context.supabase,context.userId);
  });