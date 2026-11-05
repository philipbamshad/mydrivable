import {useServerFn} from '@tanstack/react-start';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {useCallback,useState} from 'react';
import {startStudyAttempt,answerStudyAttempt,studyAttemptsOptions} from './study-attempt.functions';
import type {StudyAnswerInput} from './study-attempt.functions';
import type {StudyAttempt,StudyFeature} from './study-attempt';
export function useStudyAttempts(userId:string) {
  const queryClient=useQueryClient();
  const {data:attempts=[],isPending}=useQuery(studyAttemptsOptions(userId));
  const startFn=useServerFn(startStudyAttempt); const answerFn=useServerFn(answerStudyAttempt);
  const [busy,setBusy]=useState(false); const [error,setError]=useState<string|null>(null);
  const update=useCallback((row:StudyAttempt)=>queryClient.setQueryData<StudyAttempt[]>(studyAttemptsOptions(userId).queryKey,old=>[row,...(old??[]).filter(a=>a.id!==row.id)]),[queryClient,userId]);
  const start=useCallback(async(feature:StudyFeature)=>{setBusy(true);setError(null);try{const row=await startFn({data:{feature}}); update(row); return row;}catch(e){setError(e instanceof Error?e.message:'Unable to start.');return null;}finally{setBusy(false);}},[startFn,update]);
  const answer=useCallback(async(data:StudyAnswerInput)=>{setBusy(true);setError(null);try{const row=await answerFn({data});update(row);await Promise.all([queryClient.invalidateQueries({queryKey:['mock-exam-history',userId]}),queryClient.invalidateQueries({queryKey:['test-hub-progress',userId]})]);return row;}catch(e){setError(e instanceof Error?e.message:'Unable to save.');return null;}finally{setBusy(false);}},[answerFn,update,queryClient,userId]);
  return {attempts,busy:busy||isPending,error,start,answer};
}