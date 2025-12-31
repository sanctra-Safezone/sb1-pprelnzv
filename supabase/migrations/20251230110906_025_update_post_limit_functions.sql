/*
  # Update post limit functions to be plan-aware

  1. Changes
    - Update get_remaining_posts to look up user's plan limits
    - Update check_and_increment_post_count to use plan-specific limits
    - Free: 2 images, 1 video, 1 audio per day
    - Personal: 5 images, 3 videos, 3 audio per day
    - Creator: 20 images, 10 videos, 10 audio per day

  2. Notes
    - Functions check user_plans table to determine plan
    - Default to free tier limits if no plan found
*/

CREATE OR REPLACE FUNCTION public.get_remaining_posts(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_counts daily_post_counts%ROWTYPE;
  v_plan_name text := 'free';
  v_image_limit integer;
  v_video_limit integer;
  v_audio_limit integer;
BEGIN
  SELECT p.name INTO v_plan_name
  FROM user_plans up
  JOIN plans p ON up.plan_id = p.id
  WHERE up.user_id = p_user_id
  AND (up.expires_at IS NULL OR up.expires_at > now());
  
  IF v_plan_name IS NULL THEN
    v_plan_name := 'free';
  END IF;
  
  CASE v_plan_name
    WHEN 'creator' THEN
      v_image_limit := 20;
      v_video_limit := 10;
      v_audio_limit := 10;
    WHEN 'personal' THEN
      v_image_limit := 5;
      v_video_limit := 3;
      v_audio_limit := 3;
    ELSE
      v_image_limit := 2;
      v_video_limit := 1;
      v_audio_limit := 1;
  END CASE;

  SELECT * INTO v_counts
  FROM daily_post_counts
  WHERE user_id = p_user_id AND post_date = CURRENT_DATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'images', v_image_limit,
      'videos', v_video_limit,
      'audio', v_audio_limit,
      'can_post', true,
      'plan', v_plan_name
    );
  END IF;

  RETURN jsonb_build_object(
    'images', GREATEST(0, v_image_limit - v_counts.image_count),
    'videos', GREATEST(0, v_video_limit - v_counts.video_count),
    'audio', GREATEST(0, v_audio_limit - v_counts.audio_count),
    'can_post', (v_counts.image_count < v_image_limit OR v_counts.video_count < v_video_limit OR v_counts.audio_count < v_audio_limit),
    'plan', v_plan_name
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_and_increment_post_count(p_user_id uuid, p_media_type text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_counts daily_post_counts%ROWTYPE;
  v_plan_name text := 'free';
  v_image_limit integer;
  v_video_limit integer;
  v_audio_limit integer;
  v_daily_limit integer;
  v_current_count integer;
BEGIN
  IF p_media_type IS NULL OR p_media_type = '' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Text-only post allowed');
  END IF;

  IF p_media_type NOT IN ('image', 'video', 'audio') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid media type');
  END IF;

  SELECT p.name INTO v_plan_name
  FROM user_plans up
  JOIN plans p ON up.plan_id = p.id
  WHERE up.user_id = p_user_id
  AND (up.expires_at IS NULL OR up.expires_at > now());
  
  IF v_plan_name IS NULL THEN
    v_plan_name := 'free';
  END IF;
  
  CASE v_plan_name
    WHEN 'creator' THEN
      v_image_limit := 20;
      v_video_limit := 10;
      v_audio_limit := 10;
    WHEN 'personal' THEN
      v_image_limit := 5;
      v_video_limit := 3;
      v_audio_limit := 3;
    ELSE
      v_image_limit := 2;
      v_video_limit := 1;
      v_audio_limit := 1;
  END CASE;

  IF p_media_type = 'image' THEN
    v_daily_limit := v_image_limit;
  ELSIF p_media_type = 'video' THEN
    v_daily_limit := v_video_limit;
  ELSE
    v_daily_limit := v_audio_limit;
  END IF;

  INSERT INTO daily_post_counts (user_id, post_date, image_count, video_count, audio_count)
  VALUES (p_user_id, CURRENT_DATE, 0, 0, 0)
  ON CONFLICT (user_id, post_date) DO NOTHING;

  SELECT * INTO v_counts
  FROM daily_post_counts
  WHERE user_id = p_user_id AND post_date = CURRENT_DATE
  FOR UPDATE;

  IF p_media_type = 'image' THEN
    v_current_count := v_counts.image_count;
  ELSIF p_media_type = 'video' THEN
    v_current_count := v_counts.video_count;
  ELSE
    v_current_count := v_counts.audio_count;
  END IF;

  IF v_current_count >= v_daily_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Daily limit reached for ' || p_media_type || ' posts. Upgrade for more.',
      'remaining', 0
    );
  END IF;

  IF p_media_type = 'image' THEN
    UPDATE daily_post_counts SET image_count = image_count + 1, updated_at = now()
    WHERE user_id = p_user_id AND post_date = CURRENT_DATE;
  ELSIF p_media_type = 'video' THEN
    UPDATE daily_post_counts SET video_count = video_count + 1, updated_at = now()
    WHERE user_id = p_user_id AND post_date = CURRENT_DATE;
  ELSE
    UPDATE daily_post_counts SET audio_count = audio_count + 1, updated_at = now()
    WHERE user_id = p_user_id AND post_date = CURRENT_DATE;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Post count incremented',
    'remaining', v_daily_limit - v_current_count - 1
  );
END;
$function$;