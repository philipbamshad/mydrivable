import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import type { StudyAnswerInput } from './study-attempt.functions';
import type { StudyAttempt } from './study-attempt';
import type { ExamQuestion } from './mock-exam';
import {hubQuestion,type HubQuestion} from './test-hub';
import type {SimulationClip} from '@/data/simulation-session';
import {decisionSummary,finishScenario,recordDecision,stepProgress,type ScenarioDecision} from '@/data/simulation-game';
export async function commitAnswer(data:StudyAnswerInput,client:SupabaseClient<Database>,userId:string):Promise<StudyAttempt> {
    const {data:row,error}=await client.from('study_attempts').select('*').eq('id',data.id).eq('user_id',userId).single();
    if(error || !row) throw new Error('Attempt not found.');
    const attempt=row as unknown as StudyAttempt;
    if(attempt.version>data.version) {
      const saved=attempt.answers[data.version];
      const same=typeof saved==='number' ? saved===data.answer : data.steps && saved && saved.selectedActions?.every((action,index)=>action===data.steps?.[index]?.action);
      if(same) return attempt;
      throw new Error('Answer already committed.');
    }
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
    const {data:saved,error:saveError}=await supabaseAdmin.rpc('commit_study_answer',{p_id:attempt.id,p_user:userId,p_version:attempt.version,p_answer:JSON.parse(JSON.stringify(answer)),p_score:score,p_reaction:reaction ?? 0,p_hub:hub?JSON.parse(JSON.stringify(hub)):undefined});
    if(saveError) throw new Error('Unable to save your answer. Please retry or reload.');
    return saved as unknown as StudyAttempt;

}
