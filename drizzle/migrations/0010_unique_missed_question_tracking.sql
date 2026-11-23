CREATE OR REPLACE FUNCTION public.canonical_study_concept(concept text) RETURNS text LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT COALESCE('{"school-zone-speed":"school-zone-children","TEMPLATES-001":"SIGN_TEMPLATES-001","TEMPLATES-002":"SIGN_TEMPLATES-002","TEMPLATES-005":"SIGN_TEMPLATES-020","TEMPLATES-006":"railroad-flashing-red","TEMPLATES-011":"SIGN_TEMPLATES-032","TEMPLATES-012":"windshield","TEMPLATES-019":"trolley","TEMPLATES-022":"unmarked-crosswalk","TEMPLATES-026":"unattended-hit","TEMPLATES-027":"accident-report","TEMPLATES-047":"school-zone-children","TEMPLATES-050":"RULE_TEMPLATES-013","SIGN_TEMPLATES-024":"no-u-turn","SIGN_TEMPLATES-037":"SIGN_TEMPLATES-001","RULE_TEMPLATES-008":"TEMPLATES-033","RULE_TEMPLATES-009":"TEMPLATES-034","RULE_TEMPLATES-018":"TEMPLATES-044","RULE_TEMPLATES-023":"TEMPLATES-042","BASELINE-001":"SIGN_TEMPLATES-001","BASELINE-002":"SIGN_TEMPLATES-002","BASELINE-003":"SIGN_TEMPLATES-003","BASELINE-004":"SIGN_TEMPLATES-012","BASELINE-005":"SIGN_TEMPLATES-014","BASELINE-006":"SIGN_TEMPLATES-008","BASELINE-007":"SIGN_TEMPLATES-017","BASELINE-008":"SIGN_TEMPLATES-018","BASELINE-009":"RULE_TEMPLATES-001","BASELINE-018":"RULE_TEMPLATES-013","BASELINE-023":"TEMPLATES-044","BASELINE-028":"TEMPLATES-042","BASELINE-029":"SIGN_TEMPLATES-015","BASELINE-033":"SIGN_TEMPLATES-021","BASELINE-037":"SIGN_TEMPLATES-020","BASELINE-038":"RULE_TEMPLATES-029","BASELINE-052":"SIGN_TEMPLATES-019","BASELINE-055":"SIGN_TEMPLATES-001","state-fact-adult-bac":"TEMPLATES-033","state-fact-under21-bac":"TEMPLATES-034","state-fact-refusal":"RULE_TEMPLATES-045","state-fact-permit-age":"RULE_TEMPLATES-046","state-fact-exam-score":"RULE_TEMPLATES-049"}'::jsonb->>concept,concept) $$;
CREATE OR REPLACE FUNCTION public.normalize_study_progress(items jsonb, topic_name text, fallback_date timestamptz) RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $$
DECLARE result jsonb:='{}'::jsonb; item record; k text; v jsonb; previous jsonb; count_missed integer; last_missed text;
BEGIN
 FOR item IN SELECT key,value FROM jsonb_each(COALESCE(items,'{}'::jsonb)) ORDER BY COALESCE(value->>'lastAnsweredAt',''), (key=replace(jsonb_build_array(topic_name,public.canonical_study_concept(value->'question'->>'conceptId'))::text,', ',',')) ASC LOOP
  IF item.value->'question' IS NULL THEN CONTINUE; END IF;
  k:=CASE WHEN item.value->'question'->>'conceptId' IS NOT NULL THEN replace(jsonb_build_array(topic_name,public.canonical_study_concept(item.value->'question'->>'conceptId'))::text,', ',',') ELSE COALESCE(item.value->'question'->>'key',item.key) END;
  v:=jsonb_set(item.value,'{question,key}',to_jsonb(k),true); previous:=result->k;
  count_missed:=GREATEST(COALESCE((v->>'missedCount')::integer,CASE WHEN COALESCE((v->>'missed')::boolean,false) THEN 1 ELSE 0 END),COALESCE((previous->>'missedCount')::integer,0));
  last_missed:=GREATEST(v->>'lastMissedAt',previous->>'lastMissedAt',CASE WHEN COALESCE((v->>'missed')::boolean,false) AND v->>'lastMissedAt' IS NULL THEN fallback_date::text ELSE NULL END);
  v:=v||jsonb_build_object('everCorrect',COALESCE((v->>'everCorrect')::boolean,(v->>'correct')::boolean,false) OR COALESCE((previous->>'everCorrect')::boolean,(previous->>'correct')::boolean,false),'missedCount',count_missed,'lastMissedAt',last_missed);
  result:=jsonb_set(result,ARRAY[k],v,true);
 END LOOP;
 RETURN result;
END $$;
CREATE OR REPLACE FUNCTION public.track_unique_study_misses() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE old_items jsonb:='{}'::jsonb; item record; previous jsonb; v jsonb;
BEGIN
 IF TG_OP='UPDATE' THEN old_items:=public.normalize_study_progress(OLD.questions,OLD.topic,OLD.updated_at); END IF;
 NEW.questions:=public.normalize_study_progress(NEW.questions,NEW.topic,NEW.updated_at);
 FOR item IN SELECT key,value FROM jsonb_each(NEW.questions) LOOP
  previous:=old_items->item.key; v:=item.value;
  IF v IS DISTINCT FROM previous AND v->>'lastAnsweredAt' IS NULL AND (previous IS NULL OR (v->'correct') IS DISTINCT FROM (previous->'correct') OR (v->'question') IS DISTINCT FROM (previous->'question') OR (v->'recovery') IS DISTINCT FROM (previous->'recovery') OR v->>'missedCount' IS DISTINCT FROM previous->>'missedCount') THEN
   v:=v||jsonb_build_object('missedCount',COALESCE((previous->>'missedCount')::integer,0)+CASE WHEN COALESCE((v->>'correct')::boolean,false) THEN 0 ELSE 1 END,'lastMissedAt',CASE WHEN COALESCE((v->>'correct')::boolean,false) THEN previous->>'lastMissedAt' ELSE now()::text END,'lastAnsweredAt',now()::text);
   NEW.questions:=jsonb_set(NEW.questions,ARRAY[item.key],v,true);
  END IF;
 END LOOP;
 RETURN NEW;
END $$;
CREATE TRIGGER unique_study_misses BEFORE INSERT OR UPDATE OF questions ON public.test_hub_progress FOR EACH ROW EXECUTE FUNCTION public.track_unique_study_misses();