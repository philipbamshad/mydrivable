import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { studyPlanAllowed } from './plan-rules';
import { PILLAR_META } from '@/data/dmv/practice-bank';
export const getStudyPlan=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const {data:pro,error}=await context.supabase.rpc('has_pro_access',{p_user:context.userId});
  if(error) throw new Error('Unable to load your study plan.');
  if(!studyPlanAllowed(pro===true)) return {locked:true as const};
  const {data:profile,error:profileError}=await context.supabase.from('user_profiles').select('active_state,target_date').eq('user_id',context.userId).single();
  if(profileError) throw new Error('Unable to load your test date.');
  const {data:rows,error:progressError}=await context.supabase.from('test_hub_progress').select('topic,last_score').eq('user_id',context.userId).eq('state',profile.active_state).order('last_score',{ascending:true,nullsFirst:true});
  if(progressError) throw new Error('Unable to load your study plan.');
  const weakest=rows?.[0]?.topic;
  const title=weakest && weakest in PILLAR_META ? PILLAR_META[weakest as keyof typeof PILLAR_META].title : PILLAR_META.signs.title;
  return {locked:false as const,date:profile.target_date,tasks:[`Practice ${title}`,`Take a full-length ${profile.active_state} mock exam`,'Review your missed questions and handbook explanations']};
});