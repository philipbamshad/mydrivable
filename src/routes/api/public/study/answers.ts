import {createFileRoute} from '@tanstack/react-router';
import {createClient} from '@supabase/supabase-js';
import type {Database} from '@/integrations/supabase/types';
import {studyAnswerSchema} from '@/lib/study-answer-schema';
import {z} from 'zod';
export const Route=createFileRoute('/api/public/study/answers')({server:{handlers:{POST:async({request})=>{
 const token=request.headers.get('authorization')?.replace(/^Bearer /,'');
 if(!token)return new Response('Unauthorized',{status:401});
 const url=process.env['SUPABASE_URL'],key=process.env['SUPABASE_PUBLISHABLE_KEY'];
 if(!url||!key)return new Response('Unavailable',{status:503});
 const client=createClient<Database>(url,key,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.auth.getUser(token);if(error||!data.user)return new Response('Unauthorized',{status:401});
 const {data:allowed}=await client.rpc('is_allowlisted');if(allowed!==true)return new Response('Forbidden',{status:403});
 const parsed=z.array(studyAnswerSchema).min(1).max(100).safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return new Response('Invalid answers',{status:400});
 const {commitAnswer}=await import('@/lib/study-answer.server');
 const rows=[];try{for(const answer of parsed.data)rows.push(await commitAnswer(answer,client,data.user.id));}
 catch{return Response.json({rows},{status:409,headers:{'Cache-Control':'no-store'}});}
 return Response.json({rows},{headers:{'Cache-Control':'no-store'}});
}}}});
