import {Lock} from 'lucide-react';
import {Badge} from '@/components/ui/badge';
import {useUserProfile} from '@/lib/user-profile';
export function RestrictedProBadge({restricted}:{restricted:boolean}) {
  const {isPro,hydrating}=useUserProfile();
  if(hydrating||isPro||!restricted)return null;
  return <Badge variant="outline" className="gap-1 border-border bg-muted text-foreground"><Lock aria-hidden="true" className="size-3"/>Pro</Badge>;
}