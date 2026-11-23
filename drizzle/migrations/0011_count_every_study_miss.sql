CREATE OR REPLACE FUNCTION public.track_unique_study_misses() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE old_items jsonb:='{}'::jsonb; item record; previous jsonb; v jsonb;
BEGIN
 IF TG_OP='UPDATE' THEN old_items:=public.normalize_study_progress(OLD.questions,OLD.topic,OLD.updated_at); END IF;
 NEW.questions:=public.normalize_study_progress(NEW.questions,NEW.topic,NEW.updated_at);
 FOR item IN SELECT key,value FROM jsonb_each(NEW.questions) LOOP
  previous:=old_items->item.key; v:=item.value;
  IF v IS DISTINCT FROM previous AND v->>'lastAnsweredAt' IS NULL THEN
   v:=v||jsonb_build_object('missedCount',COALESCE((previous->>'missedCount')::integer,0)+CASE WHEN COALESCE((v->>'correct')::boolean,false) THEN 0 ELSE 1 END,'lastMissedAt',CASE WHEN COALESCE((v->>'correct')::boolean,false) THEN previous->>'lastMissedAt' ELSE now()::text END,'lastAnsweredAt',now()::text);
   NEW.questions:=jsonb_set(NEW.questions,ARRAY[item.key],v,true);
  END IF;
 END LOOP;
 RETURN NEW;
END $$;