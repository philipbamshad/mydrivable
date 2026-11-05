ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS under_18 boolean;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
COMMENT ON COLUMN public.user_profiles.under_18 IS 'Self-reported permit exam age band; NULL until first-sign-in setup is completed.';