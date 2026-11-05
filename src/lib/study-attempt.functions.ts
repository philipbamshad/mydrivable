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
    const {data:profile,error:profileError} = await context.supabase.from('user_profiles').select('active_state').eq('user_id',context.userId).single();
    if(profileError || !profile.active_state) throw new Error('Choose your Active state before practicing.');
    const state = profile.active_state;
    let payload: unknown[];
    if(data.feature==='simulation') payload=createSimulationSession(SIMULATION_CLIPS);
    else if(data.feature==='exam') payload=randomSubset(buildExamPool(state),getStatePack(state).rules.questionsCount).map(q=>shuffleAnswers(q));
    else if(data.feature==='review') {
      const {data:pro,error:proError}=await context.supabase.rpc('has_pro_access',{p_user:context.userId});
      if(proError || !pro) throw new Error('Review missed questions is Pro only.');
      const {data:rows,error}=await context.supabase.from('test_hub_progress').select('*').eq('user_id',context.userId).eq('state',state);
      if(error) throw new Error('Unable to load missed questions.');
      payload=missedQuestions((rows??[]).map(r=>({topic:r.topic,questions:r.questions,lastScore:r.last_score}) as unknown as TopicProgress)).map(q=>shuffleAnswers(q));
    } else payload=randomSubset(buildPillarBanks(state)[data.feature],8).map(q=>shuffleAnswers(hubQuestion(q,data.feature as HubQuestion['topic'])));
    if(!payload.length) throw new Error('No questions available to review.');
    const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
    const {data:row,error}=await supabaseAdmin.rpc('reserve_study_attempt',{p_user:context.userId,p_feature:data.feature,p_state:state,p_payload:JSON.parse(JSON.stringify(payload))});
    if(error) throw new Error('Unable to reserve your attempt. Please try again.');
    return asAttempt(row);
  });
function randomSubset<T>(items:T[],count:number):T[] {
  const result=[...items];
  for(let i=result.length-1;i>0;i--) {const j=Math.floor(Math.random()*(i+1)); [result[i],result[j]]=[result[j],result[i]];}
  return result.slice(0,count);
}
export const answerStudyAttempt=createServerFn({method:'POST'}).middleware([requireAllowlisted])
  .inputValidator((input:unknown)=>z.object({id:z.string().uuid(),version:z.number().int().nonnegative(),answer:z.number().int().min(0).max(3).optional(),steps:z.array(z.object({action:z.enum(['go','yield','stop']).nullable(),elapsed:z.number().min(0).max(86400000)})).min(1).max(2).optional(),timed:z.boolean().optional()}).parse(input))
  .handler(async({data,context})=>{
    const {data:row,error}=await context.supabase.from('study_attempts').select('*').eq('id',data.id).eq('user_id',context.userId).single();
    if(error || !row) throw new Error('Attempt not found.');
    const attempt=asAttempt(row);
    if(attempt.completed || attempt.version!==data.version) throw new Error('Attempt changed. Reload to continue.');
    const item=attempt.payload[attempt.version];
    if(!item) throw new Error('No unanswered question.');
    let answer:number|ScenarioDecision; let score:number; let reaction:number|null=null;
    let hub:{topic:HubQuestion['topic'];question:HubQuestion;correct:boolean}|null=null;
    if(attempt.feature==='simulation') {
      const clip=item as SimulationClip;
      if(!data.steps) throw new Error('Decision required.');
      const records:ScenarioDecision[]=[];
      for(const [index,step] of data.steps.entries()) {
        const expected=clip.steps[index]; if(!expected) throw new Error('Invalid step.');
        if(index>0 && stepProgress(clip.steps,records)!=='next') throw new Error('Scenario already ended.');
        records.push(recordDecision(clip.id,step.action,expected,step.elapsed,data.timed!==false));
      }
      if(stepProgress(clip.steps,records)==='next') throw new Error('Choose the next required action.');
      answer=finishScenario(clip.steps,records);
      const summary=decisionSummary([...(attempt.answers as ScenarioDecision[]),answer]); score=summary.accuracy; reaction=summary.averageReaction;
    } else {
      const q=item as ExamQuestion|HubQuestion;
      if(data.answer===undefined || !q.options[data.answer]) throw new Error('Valid answer required.');
      answer=data.answer;
      const answers=[...(attempt.answers as number[]),answer];
      score=Math.round(answers.filter((a,i)=>a===(attempt.payload[i] as ExamQuestion).correct).length/answers.length*100);
      const question=hubQuestion(q, q.topic);
      hub={topic:question.topic,question,correct:answer===question.correct};
    }
    const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
    const {data:saved,error:saveError}=await supabaseAdmin.rpc('commit_study_answer',{p_id:attempt.id,p_user:context.userId,p_version:attempt.version,p_answer:JSON.parse(JSON.stringify(answer)),p_score:score,p_reaction:reaction ?? 0,p_hub:hub?JSON.parse(JSON.stringify(hub)):undefined});
    if(saveError) throw new Error('Unable to save your answer. Please retry or reload.');
    return asAttempt(saved);
  });