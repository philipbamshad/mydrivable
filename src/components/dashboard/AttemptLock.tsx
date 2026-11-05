import {Lock} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {ATTEMPT_LOCK_MESSAGE} from '@/lib/study-attempt';
export function AttemptLock({onUpgrade}:{onUpgrade:()=>void}) {
  return <div className="mt-4 space-y-3 text-center"><Lock className="mx-auto size-5 text-muted-foreground"/><p className="text-sm text-muted-foreground">{ATTEMPT_LOCK_MESSAGE}</p><Button onClick={onUpgrade} className="rounded-full">Upgrade to Pro</Button></div>;
}