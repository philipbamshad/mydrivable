CREATE TABLE public.test_hub_progress (
  user_id uuid NOT NULL,
  state text NOT NULL,
  topic text NOT NULL CHECK (topic IN ('signs', 'intersections', 'substances', 'speed')),
  questions jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_score integer CHECK (last_score BETWEEN 0 AND 100),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, state, topic)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.test_hub_progress TO authenticated;
GRANT ALL ON public.test_hub_progress TO service_role;
ALTER TABLE public.test_hub_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own test hub progress" ON public.test_hub_progress
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);