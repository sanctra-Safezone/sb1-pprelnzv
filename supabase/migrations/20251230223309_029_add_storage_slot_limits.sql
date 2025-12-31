/*
  # Plan-Based Storage Slot Limits

  1. New Functions
    - `get_storage_usage` - Returns current storage usage by type
    - `check_storage_limit` - Checks if user can store more media

  2. Storage Limits by Plan
    - Free: 10 images, 3 videos, 5 audio
    - Personal: 50 images, 15 videos, 25 audio
    - Creator: 200 images, 50 videos, 100 audio
*/

CREATE OR REPLACE FUNCTION get_user_plan_name(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_name text;
BEGIN
  SELECT p.name INTO v_plan_name
  FROM user_plans up
  JOIN plans p ON up.plan_id = p.id
  WHERE up.user_id = p_user_id
  AND (up.expires_at IS NULL OR up.expires_at > now());

  RETURN COALESCE(v_plan_name, 'free');
END;
$$;

CREATE OR REPLACE FUNCTION get_storage_limits(p_plan_name text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE p_plan_name
    WHEN 'creator' THEN jsonb_build_object('images', 200, 'videos', 50, 'audio', 100)
    WHEN 'personal' THEN jsonb_build_object('images', 50, 'videos', 15, 'audio', 25)
    ELSE jsonb_build_object('images', 10, 'videos', 3, 'audio', 5)
  END;
END;
$$;

CREATE OR REPLACE FUNCTION get_storage_usage(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_image_count integer;
  v_video_count integer;
  v_audio_count integer;
  v_plan_name text;
  v_limits jsonb;
BEGIN
  SELECT get_user_plan_name(p_user_id) INTO v_plan_name;
  SELECT get_storage_limits(v_plan_name) INTO v_limits;

  SELECT COUNT(*) INTO v_image_count
  FROM posts
  WHERE user_id = p_user_id AND media_type = 'image';

  SELECT COUNT(*) INTO v_video_count
  FROM posts
  WHERE user_id = p_user_id AND media_type = 'video';

  SELECT COUNT(*) INTO v_audio_count
  FROM posts
  WHERE user_id = p_user_id AND media_type = 'audio';

  RETURN jsonb_build_object(
    'usage', jsonb_build_object(
      'images', v_image_count,
      'videos', v_video_count,
      'audio', v_audio_count
    ),
    'limits', v_limits,
    'plan', v_plan_name
  );
END;
$$;

CREATE OR REPLACE FUNCTION check_storage_limit(p_user_id uuid, p_media_type text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usage jsonb;
  v_current integer;
  v_limit integer;
  v_type_key text;
BEGIN
  SELECT get_storage_usage(p_user_id) INTO v_usage;

  v_type_key := CASE p_media_type
    WHEN 'image' THEN 'images'
    WHEN 'video' THEN 'videos'
    WHEN 'audio' THEN 'audio'
    ELSE 'images'
  END;

  v_current := (v_usage->'usage'->>v_type_key)::integer;
  v_limit := (v_usage->'limits'->>v_type_key)::integer;

  IF v_current >= v_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'message', 'Storage limit reached. Upgrade your plan for more space.',
      'current', v_current,
      'limit', v_limit,
      'plan', v_usage->>'plan'
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'current', v_current,
    'limit', v_limit,
    'remaining', v_limit - v_current,
    'plan', v_usage->>'plan'
  );
END;
$$;