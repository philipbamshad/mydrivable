CREATE TABLE public.app_allowlist (
  email text PRIMARY KEY CHECK (email = lower(email)),
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.app_allowlist TO service_role;
ALTER TABLE public.app_allowlist ENABLE ROW LEVEL SECURITY;
INSERT INTO public.app_allowlist (email, note) VALUES ('philipbamshad@gmail.com', 'Owner');

CREATE OR REPLACE FUNCTION public.is_allowlisted()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.app_allowlist a
    JOIN auth.users u ON lower(u.email) = a.email
    WHERE u.id = auth.uid()
  )
$$;
REVOKE ALL ON FUNCTION public.is_allowlisted() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_allowlisted() TO authenticated, service_role;

CREATE TABLE public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.waitlist TO anon, authenticated;
GRANT ALL ON public.waitlist TO service_role;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can join the waitlist" ON public.waitlist FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(email) BETWEEN 5 AND 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

CREATE POLICY "Allowlist only" ON public.driving_logs AS RESTRICTIVE FOR ALL TO authenticated USING (public.is_allowlisted()) WITH CHECK (public.is_allowlisted());
CREATE POLICY "Allowlist only" ON public.messages AS RESTRICTIVE FOR ALL TO authenticated USING (public.is_allowlisted()) WITH CHECK (public.is_allowlisted());
CREATE POLICY "Allowlist only" ON public.threads AS RESTRICTIVE FOR ALL TO authenticated USING (public.is_allowlisted()) WITH CHECK (public.is_allowlisted());
CREATE POLICY "Allowlist only" ON public.mock_test_history AS RESTRICTIVE FOR ALL TO authenticated USING (public.is_allowlisted()) WITH CHECK (public.is_allowlisted());
CREATE POLICY "Allowlist only" ON public.test_hub_progress AS RESTRICTIVE FOR ALL TO authenticated USING (public.is_allowlisted()) WITH CHECK (public.is_allowlisted());
CREATE POLICY "Allowlist only" ON public.user_profiles AS RESTRICTIVE FOR ALL TO authenticated USING (public.is_allowlisted()) WITH CHECK (public.is_allowlisted());
CREATE POLICY "Allowlist only" ON public.ai_coach_usage AS RESTRICTIVE FOR ALL TO authenticated USING (public.is_allowlisted()) WITH CHECK (public.is_allowlisted());
CREATE POLICY "Allowlist only" ON public.subscriptions AS RESTRICTIVE FOR SELECT TO authenticated USING (public.is_allowlisted());