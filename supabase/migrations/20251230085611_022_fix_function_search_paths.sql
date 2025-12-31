/*
  # Fix Function Search Paths for Security

  1. Security Improvements
    - Set explicit search_path for all functions to prevent search_path hijacking
    - Makes functions immune to malicious schema manipulation
  
  2. Functions Updated
    - cleanup_old_garden_whispers
    - record_download (if exists)
    - can_generate_ai (if exists)
    - spend_cty (if exists)
    - refund_cty (if exists)
    - reset_monthly_allowances (if exists)
    - can_download_sound (if exists)
    - get_user_plan (if exists)
    - get_plan_limits (if exists)
*/

-- Fix cleanup_old_garden_whispers
DROP FUNCTION IF EXISTS public.cleanup_old_garden_whispers();
CREATE OR REPLACE FUNCTION public.cleanup_old_garden_whispers()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM garden_whispers
  WHERE created_at < now() - interval '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Drop and recreate record_download if it exists
DROP FUNCTION IF EXISTS public.record_download(uuid);
CREATE OR REPLACE FUNCTION public.record_download(sound_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE sound_uploads
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = sound_id_param;
END;
$$;

-- Drop and recreate can_generate_ai if it exists
DROP FUNCTION IF EXISTS public.can_generate_ai(uuid, text);
CREATE OR REPLACE FUNCTION public.can_generate_ai(user_id_param uuid, generation_type_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan_type text;
  monthly_count integer;
  plan_limit integer;
BEGIN
  SELECT p.name INTO user_plan_type
  FROM user_plans up
  JOIN plans p ON up.plan_id = p.id
  WHERE up.user_id = user_id_param
  AND up.status = 'active'
  ORDER BY up.created_at DESC
  LIMIT 1;
  
  IF user_plan_type IS NULL THEN
    user_plan_type := 'Free';
  END IF;
  
  SELECT COUNT(*) INTO monthly_count
  FROM ai_generations
  WHERE user_id = user_id_param
  AND generation_type = generation_type_param
  AND created_at >= date_trunc('month', CURRENT_TIMESTAMP);
  
  SELECT 
    CASE generation_type_param
      WHEN 'image' THEN monthly_ai_images
      WHEN 'audio' THEN monthly_ai_audio
      ELSE 0
    END INTO plan_limit
  FROM plans
  WHERE name = user_plan_type;
  
  RETURN monthly_count < COALESCE(plan_limit, 0);
END;
$$;

-- Drop and recreate spend_cty if it exists
DROP FUNCTION IF EXISTS public.spend_cty(uuid, integer);
CREATE OR REPLACE FUNCTION public.spend_cty(user_id_param uuid, amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance integer;
BEGIN
  SELECT cty_balance INTO current_balance
  FROM user_profiles
  WHERE id = user_id_param;
  
  IF current_balance >= amount THEN
    UPDATE user_profiles
    SET cty_balance = cty_balance - amount
    WHERE id = user_id_param;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- Drop and recreate refund_cty if it exists
DROP FUNCTION IF EXISTS public.refund_cty(uuid, integer);
CREATE OR REPLACE FUNCTION public.refund_cty(user_id_param uuid, amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_profiles
  SET cty_balance = cty_balance + amount
  WHERE id = user_id_param;
END;
$$;

-- Drop and recreate reset_monthly_allowances if it exists
DROP FUNCTION IF EXISTS public.reset_monthly_allowances();
CREATE OR REPLACE FUNCTION public.reset_monthly_allowances()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN;
END;
$$;

-- Drop and recreate can_download_sound if it exists
DROP FUNCTION IF EXISTS public.can_download_sound(uuid, uuid);
CREATE OR REPLACE FUNCTION public.can_download_sound(user_id_param uuid, sound_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sound_owner_id uuid;
BEGIN
  SELECT user_id INTO sound_owner_id
  FROM sound_uploads
  WHERE id = sound_id_param;
  
  RETURN sound_owner_id = user_id_param;
END;
$$;

-- Drop and recreate get_user_plan if it exists
DROP FUNCTION IF EXISTS public.get_user_plan(uuid);
CREATE OR REPLACE FUNCTION public.get_user_plan(user_id_param uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  plan_name text;
BEGIN
  SELECT p.name INTO plan_name
  FROM user_plans up
  JOIN plans p ON up.plan_id = p.id
  WHERE up.user_id = user_id_param
  AND up.status = 'active'
  ORDER BY up.created_at DESC
  LIMIT 1;
  
  RETURN COALESCE(plan_name, 'Free');
END;
$$;

-- Drop and recreate get_plan_limits if it exists
DROP FUNCTION IF EXISTS public.get_plan_limits(text);
CREATE OR REPLACE FUNCTION public.get_plan_limits(plan_name_param text)
RETURNS TABLE (
  monthly_ai_images integer,
  monthly_ai_audio integer,
  monthly_downloads_limit integer,
  max_file_size_mb integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.monthly_ai_images,
    p.monthly_ai_audio,
    p.monthly_downloads_limit,
    p.max_file_size_mb
  FROM plans p
  WHERE p.name = plan_name_param;
END;
$$;
