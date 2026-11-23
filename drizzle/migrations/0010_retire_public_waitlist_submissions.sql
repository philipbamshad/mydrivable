DROP POLICY IF EXISTS "Anyone can join the waitlist" ON public.waitlist;
REVOKE INSERT ON public.waitlist FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.join_waitlist_checked(text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.join_waitlist_checked(text,text) TO service_role;
COMMENT ON TABLE public.waitlist IS 'Historical pre-launch list; public submissions retired in favor of free account registration.';