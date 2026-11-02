CREATE TABLE public.ai_coach_usage (user_id uuid PRIMARY KEY, used integer NOT NULL DEFAULT 0 CHECK (used >= 0));
GRANT SELECT ON public.ai_coach_usage TO authenticated;
GRANT ALL ON public.ai_coach_usage TO service_role;
ALTER TABLE public.ai_coach_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read their own Coach usage" ON public.ai_coach_usage FOR SELECT TO authenticated USING (user_id = auth.uid());
INSERT INTO public.ai_coach_usage (user_id, used) SELECT user_id, CASE WHEN COALESCE(free_usage->>'chat','0') ~ '^[0-9]+$' THEN LEAST((free_usage->>'chat')::numeric,2147483647)::integer ELSE 0 END FROM public.user_profiles ON CONFLICT (user_id) DO NOTHING;
CREATE OR REPLACE FUNCTION public.consume_ai_coach_credit() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE caller uuid := auth.uid(); next_used integer;
BEGIN
 IF caller IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 INSERT INTO public.ai_coach_usage(user_id,used) VALUES(caller,0) ON CONFLICT(user_id) DO NOTHING;
 UPDATE public.ai_coach_usage SET used = used + 1 WHERE user_id = caller AND used < 5 RETURNING used INTO next_used;
 IF next_used IS NOT NULL THEN
  UPDATE public.user_profiles SET free_usage = jsonb_set(COALESCE(free_usage,'{}'::jsonb),'{chat}',to_jsonb(next_used),true) WHERE user_id = caller;
 END IF;
 RETURN next_used;
END; $$;
REVOKE ALL ON FUNCTION public.consume_ai_coach_credit() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_ai_coach_credit() TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_coach_credit() TO service_role;