import {it,expect} from 'vitest';
import {drainAnswers,type PendingAnswer} from './answer-queue';
import type {StudyAttempt} from './study-attempt';
const entry=(version:number):PendingAnswer=>({data:{id:'attempt',version,answer:1},retries:0});
it('makes at most one initial send and three automatic retries without dropping a failed answer',async()=>{
 const queue=[entry(0),entry(1)];let calls=0;
 expect(await drainAnswers(queue,async()=>{calls++;throw Error('offline');},()=>{},()=>{},async()=>{})).toBe(false);
 expect(calls).toBe(4);expect(queue).toHaveLength(2);expect(queue[0]?.retries).toBe(3);
 expect(await drainAnswers(queue,async()=>{calls++;throw Error('offline');},()=>{},()=>{},async()=>{})).toBe(false);
 expect(calls).toBe(4);
});
it('preserves order during brief disconnection and acknowledges every answer before completion',async()=>{
 const queue=[entry(0),entry(1),entry(2)];const sent:number[]=[];let failures=2;let persisted=0;
 const ok=await drainAnswers(queue,async data=>{if(failures-->0)throw Error('offline');sent.push(data.version);return {version:data.version+1} as StudyAttempt;},()=>{persisted++;},()=>{},async()=>{});
 expect(ok).toBe(true);expect(sent).toEqual([0,1,2]);expect(queue).toHaveLength(0);expect(persisted).toBe(5);
});
it('replays the retained queue after reopening without editing answers',async()=>{
 const original=[entry(7)];original[0].retries=3;
 const reopened=JSON.parse(JSON.stringify(original)) as PendingAnswer[];reopened.forEach(e=>e.retries=0);
 const sent:number[]=[];await drainAnswers(reopened,async data=>{sent.push(data.answer??-1);return {version:8} as StudyAttempt;},()=>{},()=>{});
 expect(sent).toEqual([1]);expect(reopened).toEqual([]);
});