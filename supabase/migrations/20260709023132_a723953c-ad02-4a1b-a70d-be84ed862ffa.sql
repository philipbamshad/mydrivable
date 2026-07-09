ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS free_usage jsonb NOT NULL DEFAULT '{}'::jsonb;