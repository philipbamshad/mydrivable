CREATE OR REPLACE FUNCTION public.delete_own_app_data() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE caller uuid := auth.uid(); caller_email text := lower(auth.jwt()->>'email');
BEGIN
 IF caller IS NULL OR NOT public.is_allowlisted() THEN RAISE EXCEPTION 'Forbidden'; END IF;
 DELETE FROM public.messages WHERE thread_id IN (SELECT id FROM public.threads WHERE user_id=caller);
 DELETE FROM public.threads WHERE user_id=caller;
 DELETE FROM public.test_hub_progress WHERE user_id=caller;
 DELETE FROM public.study_attempts WHERE user_id=caller;
 DELETE FROM public.mock_test_history WHERE user_id=caller;
 DELETE FROM public.driving_logs WHERE user_id=caller;
 DELETE FROM public.ai_coach_usage WHERE user_id=caller;
 DELETE FROM public.ai_daily_usage WHERE user_id=caller;
 DELETE FROM public.subscriptions WHERE user_id=caller;
 DELETE FROM public.user_profiles WHERE user_id=caller;
 DELETE FROM public.waitlist WHERE lower(email)=caller_email;
 DELETE FROM public.email_send_log WHERE lower(recipient_email)=caller_email;
END; $$;
REVOKE ALL ON FUNCTION public.delete_own_app_data() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.delete_own_app_data() TO authenticated;
CREATE OR REPLACE FUNCTION public.commit_study_answer(p_id uuid, p_user uuid, p_version integer, p_answer jsonb, p_score integer, p_reaction double precision, p_hub jsonb DEFAULT NULL::jsonb)
 RETURNS public.study_attempts LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result public.study_attempts; topic_name text; question_key text; old_questions jsonb; old_question jsonb; new_question jsonb; correct boolean; recovery integer; missed boolean;
BEGIN
 SELECT * INTO result FROM public.study_attempts WHERE id=p_id AND user_id=p_user FOR UPDATE;
 IF NOT FOUND OR result.completed OR result.version<>p_version THEN RAISE EXCEPTION 'Attempt changed. Reload to continue.'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.app_allowlist a JOIN auth.users u ON lower(u.email)=a.email WHERE u.id=p_user) THEN RAISE EXCEPTION 'Forbidden'; END IF;
 IF NOT result.free_slot AND NOT public.has_pro_access(p_user) THEN RAISE EXCEPTION 'Pro access required'; END IF;
 UPDATE public.study_attempts SET answers=answers||jsonb_build_array(p_answer),version=version+1,completed=jsonb_array_length(answers)+1=jsonb_array_length(payload),score=p_score,average_reaction=NULLIF(p_reaction,0),updated_at=now() WHERE id=p_id RETURNING * INTO result;
 IF result.completed AND result.feature='exam' THEN INSERT INTO public.mock_test_history(user_id,score_pct,state) VALUES(p_user,p_score,result.state); END IF;
 IF p_hub IS NOT NULL THEN
 topic_name:=p_hub->>'topic'; question_key:=p_hub->'question'->>'key'; correct:=(p_hub->>'correct')::boolean;
 IF topic_name NOT IN ('signs','intersections','substances','speed') OR question_key IS NULL THEN RAISE EXCEPTION 'Invalid topic answer'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_user::text||result.state||topic_name,0));
 SELECT questions INTO old_questions FROM public.test_hub_progress WHERE user_id=p_user AND state=result.state AND topic=topic_name FOR UPDATE;
 old_questions:=COALESCE(old_questions,'{}'::jsonb); old_question:=old_questions->question_key;
 recovery:=CASE WHEN correct AND COALESCE((old_question->>'missed')::boolean,false) THEN COALESCE((old_question->>'recovery')::integer,0)+1 ELSE 0 END;
 missed:=NOT correct OR (COALESCE((old_question->>'missed')::boolean,false) AND recovery<2);
 new_question:=jsonb_build_object('question',p_hub->'question','correct',correct,'everCorrect',correct OR COALESCE((old_question->>'everCorrect')::boolean,(old_question->>'correct')::boolean,false),'missed',missed,'recovery',CASE WHEN missed THEN recovery ELSE 0 END);
 INSERT INTO public.test_hub_progress(user_id,state,topic,questions,last_score,best_score,updated_at) VALUES(p_user,result.state,topic_name,jsonb_set(old_questions,ARRAY[question_key],new_question,true),CASE WHEN result.completed AND result.feature NOT IN ('review','exam') THEN p_score ELSE NULL END,CASE WHEN result.completed AND result.feature NOT IN ('review','exam') THEN p_score ELSE NULL END,now())
 ON CONFLICT(user_id,state,topic) DO UPDATE SET questions=excluded.questions,last_score=COALESCE(excluded.last_score,test_hub_progress.last_score),best_score=CASE WHEN excluded.best_score IS NULL THEN test_hub_progress.best_score ELSE GREATEST(COALESCE(test_hub_progress.best_score,0),excluded.best_score) END,updated_at=now();
 END IF;
 RETURN result;
END; $$;