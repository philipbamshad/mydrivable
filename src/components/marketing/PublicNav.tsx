import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import logo from '@/assets/drivable-logo.png';
export function PublicNav() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    void supabase.auth.getSession().then(({data}) => setSignedIn(Boolean(data.session)));
    const {data} = supabase.auth.onAuthStateChange((_event,session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);
  return <header className="border-b border-border bg-background"><div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-3 px-4 sm:px-8"><Link to="/" className="flex items-center gap-2 font-display text-lg font-bold"><img src={logo} alt="" width={36} height={36} className="logo-mask"/>Drivable</Link><nav aria-label="Main" className="flex items-center gap-2 sm:gap-5"><Button variant="ghost" asChild className="px-2"><Link to="/demo">Try demo</Link></Button><Button variant="outline" asChild className="px-3 sm:px-5"><Link to={signedIn ? '/app' : '/auth'}>{signedIn ? 'My practice' : 'Sign in'}</Link></Button></nav></div></header>;
}
