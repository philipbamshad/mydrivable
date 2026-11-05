import type {StudyAnswerInput} from './study-attempt.functions';
import type {StudyAttempt} from './study-attempt';
export type PendingAnswer={data:StudyAnswerInput;retries:number};
export const MAX_ANSWER_RETRIES=3;
/** Pure ordered retry runner: removal happens only after an acknowledgement. */
export async function drainAnswers(queue:PendingAnswer[],send:(data:StudyAnswerInput)=>Promise<StudyAttempt>,persist:()=>void,ack:(row:StudyAttempt)=>void,wait:(ms:number)=>Promise<void>=ms=>new Promise(resolve=>setTimeout(resolve,ms))):Promise<boolean>{
 while(queue.length){const entry=queue[0];if(!entry)return true;
  try{const row=await send(entry.data);queue.shift();persist();ack(row);}
  catch{if(entry.retries>=MAX_ANSWER_RETRIES)return false;entry.retries++;persist();await wait(250*2**(entry.retries-1));}
 }
 return true;
}
