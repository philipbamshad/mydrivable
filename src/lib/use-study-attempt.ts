import {useServerFn} from '@tanstack/react-start';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {useCallback,useState,useSyncExternalStore} from 'react';
import {enqueueAnswer,flushAnswers,answerFailure,subscribeAnswers,latestSavedAnswer,queuedAttempt} from './answer-queue.client';
import {startStudyAttempt,studyAttemptsOptions} from './study-attempt.functions';
import type {StudyAnswerInput} from './study-attempt.functions';
import type {StudyAttempt,StudyFeature} from './study-attempt';
export function useStudyAttempts(userId:string) {
  const queryClient=useQueryClient();
  const {data:attempts=[],isPending}=useQuery(studyAttemptsOptions(userId));
  const startFn=useServerFn(startStudyAttempt); 
  const [busy,setBusy]=useState(false); const [error,setError]=useState<string|null>(null);
  const update=useCallback((row:StudyAttempt)=>queryClient.setQueryData<StudyAttempt[]>(studyAttemptsOptions(userId).queryKey,old=>[row,...(old??[]).filter(a=>a.id!==row.id)]),[queryClient,userId]);
  const start=useCallback(async(feature:StudyFeature)=>{setBusy(true);setError(null);try{const row=await startFn({data:{feature}}); update(row); return queuedAttempt(userId,row);}catch(e){setError(e instanceof Error?e.message:'Unable to start.');return null;}finally{setBusy(false);}},[startFn,update]);
  const failed=useSyncExternalStore(subscribeAnswers,()=>answerFailure(userId),()=>false);
  const answer=useCallback((data:StudyAnswerInput)=>enqueueAnswer(userId,data),[userId]);
  const finish=useCallback(async()=>{const ok=await flushAnswers(userId);if(!ok)return false;const row=latestSavedAnswer(userId);if(row)update(row);await Promise.all([queryClient.invalidateQueries({queryKey:['mock-exam-history',userId]}),queryClient.invalidateQueries({queryKey:['test-hub-progress',userId]})]);return true;},[userId,update,queryClient]);
  return {attempts:attempts.map(a=>queuedAttempt(userId,a)),busy:busy||isPending,error:failed?"Some answers didn't save. Check your connection.":error,start,answer,finish};
}