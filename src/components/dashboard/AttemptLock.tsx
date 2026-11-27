import {Lock} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {ATTEMPT_LOCK_MESSAGE} from '@/lib/study-attempt';
export function AttemptLock({onUpgrade, message=ATTEMPT_LOCK_MESSAGE}:{onUpgrade:()=>void;message?:string}) {
  return <div className="mt-4 space-y-3 text-center"><Lock className="mx-auto size-5 text-muted-foreground"/><p className="text-sm text-muted-foreground">{message}</p><Button onClick={onUpgrade} className="rounded-full">Get Pro – $24 once</Button></div>;
}