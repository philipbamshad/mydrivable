import {supabase} from '@/integrations/supabase/client';
import {drainAnswers,type PendingAnswer} from './answer-queue';
import type {StudyAnswerInput} from './study-attempt.functions';
import type {StudyAttempt} from './study-attempt';
import {recordDecision,finishScenario} from '@/data/simulation-game';
import type {SimulationClip} from '@/data/simulation-session';
const listeners=new Set<()=>void>();
const bearerByOwner=new Map<string,string>();
supabase.auth.onAuthStateChange((_event,session)=>{bearerByOwner.clear();if(session)bearerByOwner.set(session.user.id,session.access_token);});
const owners=new Map<string,{queue:PendingAnswer[];running:Promise<boolean>|null;failed:boolean;row?:StudyAttempt}>();
const key=(id:string)=>`drivable.answer-queue.v1.${id}`;
function owner(id:string){let state=owners.get(id);if(!state){let queue:PendingAnswer[]=[];try{queue=JSON.parse(localStorage.getItem(key(id))??'[]');}catch{/* Preserve unreadable storage without deleting it. */}state={queue,running:null,failed:false};owners.set(id,state);}return state;}
function emit(){listeners.forEach(fn=>fn());}
function persist(id:string){try{localStorage.setItem(key(id),JSON.stringify(owner(id).queue));}catch{owner(id).failed=true;}emit();}
export function subscribeAnswers(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};}
export const answerFailure=(id:string)=>owner(id).failed;
export async function flushAnswers(id:string):Promise<boolean>{
 const state=owner(id);if(state.running)return state.running;
 state.running=(async()=>{
  const ok=await drainAnswers(state.queue,async data=>{
   const {data:session}=await supabase.auth.getSession();if(session.session?.user.id!==id)throw new Error('Session changed');
   bearerByOwner.set(id,session.session.access_token);
   const response=await fetch('/api/public/study/answers',{method:'POST',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json',Authorization:`Bearer ${session.session.access_token}`},body:JSON.stringify([data])});
   if(!response.ok)throw new Error('Unconfirmed answer');const body=await response.json() as {rows:StudyAttempt[]};const row=body.rows[0];if(!row)throw new Error('Missing acknowledgement');return row;
  },()=>persist(id),row=>{state.row=row;});state.failed=!ok;emit();return ok;
 })();try{return await state.running;}finally{state.running=null;}
}
export function enqueueAnswer(id:string,data:StudyAnswerInput){const state=owner(id);if(!state.queue.some(e=>e.data.id===data.id&&e.data.version===data.version)){state.queue.push({data,retries:0});persist(id);}void flushAnswers(id);}
export function queuedAttempt(id:string,attempt:StudyAttempt):StudyAttempt{
 const confirmed=latestSavedAnswer(id);
 let row=confirmed?.id===attempt.id && confirmed.version>attempt.version ? {...confirmed,answers:[...confirmed.answers]} : {...attempt,answers:[...attempt.answers]};
 for(const {data} of owner(id).queue){if(data.id!==row.id||data.version!==row.version)continue;
 const clip=row.payload[data.version] as SimulationClip;
 const answer=data.answer ?? (data.steps ? finishScenario(clip.steps,data.steps.map((step,index)=>recordDecision(clip.id,step.action,clip.steps[index] ?? '',step.elapsed,data.timed!==false))) : 0);
 row={...row,answers:[...row.answers,answer],version:row.version+1};}return row;
}
export function resumeAnswers(id:string){const state=owner(id);state.queue.forEach(e=>{e.retries=0;e.exhausted=false;});return flushAnswers(id);}
export function leaveAnswers(id:string){const state=owner(id),token=bearerByOwner.get(id);if(!state.queue.length||!token)return;const batch:StudyAnswerInput[]=[];for(const entry of state.queue){if(new TextEncoder().encode(JSON.stringify([...batch,entry.data])).length>60000)break;batch.push(entry.data);}if(!batch.length)return;void fetch('/api/public/study/answers',{method:'POST',keepalive:true,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(batch)}).catch(()=>{});}
export const latestSavedAnswer=(id:string)=>owner(id).row;
