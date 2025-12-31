/*
  # Fix RLS Performance and Security Issues

  1. RLS Policy Optimizations
    - Replace `auth.uid()` with `(select auth.uid())` for better query performance
    - Consolidate duplicate permissive policies on user_profiles

  2. Function Search Path Fixes
    - Set immutable search_path on functions with mutable paths

  3. Cleanup
    - Remove duplicate policies on user_profiles table
*/

-- Fix daily_post_counts RLS policies
DROP POLICY IF EXISTS "Users can read own post counts" ON daily_post_counts;
DROP POLICY IF EXISTS "Users can insert own post counts" ON daily_post_counts;
DROP POLICY IF EXISTS "Users can update own post counts" ON daily_post_counts;

CREATE POLICY "Users can read own post counts"
  ON daily_post_counts
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own post counts"
  ON daily_post_counts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own post counts"
  ON daily_post_counts
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Fix messages RLS policy
DROP POLICY IF EXISTS "Users can update messages in own conversations" ON messages;

CREATE POLICY "Users can update messages in own conversations"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.user1_id = (select auth.uid()) OR c.user2_id = (select auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.user1_id = (select auth.uid()) OR c.user2_id = (select auth.uid()))
    )
  );

-- Fix daily_ai_generation_counts RLS policies
DROP POLICY IF EXISTS "Users can read own AI generation counts" ON daily_ai_generation_counts;
DROP POLICY IF EXISTS "Users can insert own AI generation counts" ON daily_ai_generation_counts;
DROP POLICY IF EXISTS "Users can update own AI generation counts" ON daily_ai_generation_counts;

CREATE POLICY "Users can read own AI generation counts"
  ON daily_ai_generation_counts
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own AI generation counts"
  ON daily_ai_generation_counts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own AI generation counts"
  ON daily_ai_generation_counts
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Fix daily_cty_claims RLS policy
DROP POLICY IF EXISTS "Users can view own claims" ON daily_cty_claims;

CREATE POLICY "Users can view own claims"
  ON daily_cty_claims
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Fix user_profiles duplicate policies - drop old ones and create optimized versions
DROP POLICY IF EXISTS "read_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "update_own_profile" ON user_profiles;

-- Keep "Anyone can view profiles" for public viewing
-- Keep "Users can update own profile" but ensure it uses optimized auth call
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- Drop and recreate functions with proper search_path
DROP FUNCTION IF EXISTS spend_cty(uuid, integer);
DROP FUNCTION IF EXISTS refund_cty(uuid, integer);
DROP FUNCTION IF EXISTS can_download_sound(uuid);
DROP FUNCTION IF EXISTS get_user_plan(uuid);
DROP FUNCTION IF EXISTS get_plan_limits(text);
DROP FUNCTION IF EXISTS get_storage_limits(text);

CREATE FUNCTION spend_cty(p_user_id uuid, p_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance integer;
BEGIN
  SELECT cty_balance INTO v_current_balance
  FROM user_profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RETURN false;
  END IF;

  UPDATE user_profiles
  SET cty_balance = cty_balance - p_amount
  WHERE id = p_user_id;

  RETURN true;
END;
$$;

CREATE FUNCTION refund_cty(p_user_id uuid, p_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_profiles
  SET cty_balance = COALESCE(cty_balance, 0) + p_amount
  WHERE id = p_user_id;

  RETURN true;
END;
$$;

CREATE FUNCTION can_download_sound(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM sound_uploads
  WHERE user_id = p_user_id;

  RETURN v_count < 1;
END;
$$;

CREATE FUNCTION get_user_plan(p_user_id uuid)
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

CREATE FUNCTION get_plan_limits(p_plan_name text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN CASE p_plan_name
    WHEN 'creator' THEN jsonb_build_object('images', 20, 'videos', 10, 'audio', 10, 'maxVideoSeconds', 30, 'maxAudioSeconds', 120)
    WHEN 'personal' THEN jsonb_build_object('images', 5, 'videos', 3, 'audio', 3, 'maxVideoSeconds', 10, 'maxAudioSeconds', 60)
    ELSE jsonb_build_object('images', 2, 'videos', 1, 'audio', 1, 'maxVideoSeconds', 10, 'maxAudioSeconds', 30)
  END;
END;
$$;

CREATE FUNCTION get_storage_limits(p_plan_name text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN CASE p_plan_name
    WHEN 'creator' THEN jsonb_build_object('images', 200, 'videos', 50, 'audio', 100)
    WHEN 'personal' THEN jsonb_build_object('images', 50, 'videos', 15, 'audio', 25)
    ELSE jsonb_build_object('images', 10, 'videos', 3, 'audio', 5)
  END;
END;
$$;