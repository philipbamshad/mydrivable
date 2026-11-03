CREATE UNIQUE INDEX IF NOT EXISTS waitlist_normalized_email_key ON public.waitlist (lower(btrim(email)));
REVOKE INSERT ON public.waitlist FROM anon, authenticated;
GRANT ALL ON public.waitlist TO service_role;
CREATE TABLE public.waitlist_submission_windows (visitor_hash text PRIMARY KEY CHECK (length(visitor_hash)=64), started_at timestamptz NOT NULL DEFAULT now(), submissions integer NOT NULL DEFAULT 0 CHECK (submissions BETWEEN 0 AND 3));
GRANT ALL ON public.waitlist_submission_windows TO service_role;
ALTER TABLE public.waitlist_submission_windows ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.join_waitlist_checked(p_email text, p_visitor_hash text) RETURNS TABLE (result text, signup_id uuid, signup_time timestamptz) LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE normalized text := lower(btrim(p_email)); existing_id uuid; existing_time timestamptz; bucket public.waitlist_submission_windows%ROWTYPE; new_id uuid; new_time timestamptz;
BEGIN
 IF length(normalized)>255 OR normalized !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR p_visitor_hash !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'Invalid submission'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(normalized,0));
 SELECT id,created_at INTO existing_id,existing_time FROM public.waitlist WHERE lower(btrim(email))=normalized;
 IF existing_id IS NOT NULL THEN RETURN QUERY SELECT 'duplicate'::text,NULL::uuid,NULL::timestamptz; RETURN; END IF;
 INSERT INTO public.waitlist_submission_windows(visitor_hash) VALUES(p_visitor_hash) ON CONFLICT DO NOTHING;
 SELECT * INTO bucket FROM public.waitlist_submission_windows WHERE visitor_hash=p_visitor_hash FOR UPDATE;
 IF bucket.started_at <= now()-interval '1 hour' THEN UPDATE public.waitlist_submission_windows SET started_at=now(),submissions=0 WHERE visitor_hash=p_visitor_hash; bucket.submissions := 0; END IF;
 IF bucket.submissions>=3 THEN RETURN QUERY SELECT 'limited'::text,NULL::uuid,NULL::timestamptz; RETURN; END IF;
 INSERT INTO public.waitlist(email) VALUES(normalized) RETURNING id,created_at INTO new_id,new_time;
 UPDATE public.waitlist_submission_windows SET submissions=submissions+1 WHERE visitor_hash=p_visitor_hash;
 RETURN QUERY SELECT 'joined'::text,new_id,new_time;
END; $$;
REVOKE ALL ON FUNCTION public.join_waitlist_checked(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.join_waitlist_checked(text,text) TO service_role;