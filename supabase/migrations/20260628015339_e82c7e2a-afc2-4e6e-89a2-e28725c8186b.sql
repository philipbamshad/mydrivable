
-- user_profiles
CREATE TABLE public.user_profiles (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_state TEXT NOT NULL DEFAULT '',
  target_date DATE,
  daily_done JSONB NOT NULL DEFAULT '{}'::jsonb,
  daily_done_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.user_profiles
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_user_profiles_updated
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- mock_test_history
CREATE TABLE public.mock_test_history (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score_pct INTEGER NOT NULL,
  state TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX mock_test_history_user_created_idx ON public.mock_test_history (user_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mock_test_history TO authenticated;
GRANT ALL ON public.mock_test_history TO service_role;
ALTER TABLE public.mock_test_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own test history" ON public.mock_test_history
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- driving_logs
CREATE TABLE public.driving_logs (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hours NUMERIC(6,2) NOT NULL,
  maneuver TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX driving_logs_user_logged_idx ON public.driving_logs (user_id, logged_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.driving_logs TO authenticated;
GRANT ALL ON public.driving_logs TO service_role;
ALTER TABLE public.driving_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own driving logs" ON public.driving_logs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
