import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, CalendarDays } from 'lucide-react';
import { getStudyPlan } from '@/lib/study-plan.functions';
import { useUserProfile } from '@/lib/user-profile';
export function StudyPlan({userId}:{userId:string}) {
  const {isPro,unlockPro}=useUserProfile();
  const {data,error}=useQuery({queryKey:['study-plan',userId,isPro],queryFn:()=>getStudyPlan()});
  return <Card className="rounded-[28px] border-border/60 bg-card p-4 shadow-md sm:p-6">
    <h3 className="flex items-center gap-2 font-display font-bold"><CalendarDays className="size-5"/>Study plan for your test date</h3>
    {error ? <p role="alert" className="mt-3 text-sm text-destructive">Unable to load your study plan.</p> : !data ? <p className="mt-3 text-sm text-muted-foreground">Loading…</p> : data.locked ? <>
      <div aria-hidden="true" className="mt-4 select-none space-y-2 blur-sm"><div className="h-4 w-3/4 rounded bg-muted"/><div className="h-4 w-1/2 rounded bg-muted"/><div className="h-4 w-2/3 rounded bg-muted"/></div>
      <p className="mt-4 text-sm text-muted-foreground">Your test-date study plan is included with Pro.</p><Button className="mt-3 rounded-full" onClick={unlockPro}><Lock/>Get Pro – $24 once</Button>
    </> : <><p className="mt-3 text-sm text-muted-foreground">{data.date ? `Test date: ${data.date}` : 'Set your DMV target date in Settings.'}</p><ol className="mt-3 list-inside list-decimal space-y-2 text-sm">{data.tasks.map(task=><li key={task}>{task}</li>)}</ol></>}
  </Card>;
}