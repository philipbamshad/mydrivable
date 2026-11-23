CREATE OR REPLACE FUNCTION public.normalize_study_progress(items jsonb, topic_name text, fallback_date timestamptz) RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $$
DECLARE result jsonb:='{}'::jsonb; text_keys jsonb:='{}'::jsonb; item record; k text; signature text; v jsonb; previous jsonb; count_missed integer; last_missed text;
BEGIN
 FOR item IN SELECT key,value FROM jsonb_each(COALESCE(items,'{}'::jsonb)) WHERE value->'question'->>'conceptId' IS NOT NULL ORDER BY public.canonical_study_concept(value->'question'->>'conceptId') LOOP
  signature:=jsonb_build_array(lower(trim(regexp_replace(item.value->'question'->>'q','\s+',' ','g'))),item.value->'question'->'sign')::text;
  k:=replace(jsonb_build_array(topic_name,public.canonical_study_concept(item.value->'question'->>'conceptId'))::text,', ',',');
  IF text_keys->>signature IS NULL THEN text_keys:=jsonb_set(text_keys,ARRAY[signature],to_jsonb(k),true); END IF;
 END LOOP;
 FOR item IN SELECT key,value FROM jsonb_each(COALESCE(items,'{}'::jsonb)) ORDER BY COALESCE(value->>'lastAnsweredAt',''), (key=replace(jsonb_build_array(topic_name,public.canonical_study_concept(value->'question'->>'conceptId'))::text,', ',',')) ASC LOOP
  IF item.value->'question' IS NULL THEN CONTINUE; END IF;
  signature:=jsonb_build_array(lower(trim(regexp_replace(item.value->'question'->>'q','\s+',' ','g'))),item.value->'question'->'sign')::text;
  k:=COALESCE(text_keys->>signature,CASE WHEN item.value->'question'->>'conceptId' IS NOT NULL THEN replace(jsonb_build_array(topic_name,public.canonical_study_concept(item.value->'question'->>'conceptId'))::text,', ',',') ELSE COALESCE(item.value->'question'->>'key',item.key) END);
  v:=jsonb_set(item.value,'{question,key}',to_jsonb(k),true);
  IF text_keys->>signature IS NOT NULL THEN v:=jsonb_set(v,'{question,conceptId}',to_jsonb(k::jsonb->>1),true); END IF;
  previous:=result->k;
  count_missed:=GREATEST(COALESCE((v->>'missedCount')::integer,CASE WHEN COALESCE((v->>'missed')::boolean,false) THEN 1 ELSE 0 END),COALESCE((previous->>'missedCount')::integer,0));
  last_missed:=GREATEST(v->>'lastMissedAt',previous->>'lastMissedAt',CASE WHEN COALESCE((v->>'missed')::boolean,false) AND v->>'lastMissedAt' IS NULL THEN fallback_date::text ELSE NULL END);
  v:=v||jsonb_build_object('everCorrect',COALESCE((v->>'everCorrect')::boolean,(v->>'correct')::boolean,false) OR COALESCE((previous->>'everCorrect')::boolean,(previous->>'correct')::boolean,false),'missedCount',count_missed,'lastMissedAt',last_missed);
  result:=jsonb_set(result,ARRAY[k],v,true);
 END LOOP;
 RETURN result;
END $$;