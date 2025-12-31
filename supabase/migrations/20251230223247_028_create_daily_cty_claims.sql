/*
  # Daily Free CTY System

  1. New Tables
    - `daily_cty_claims`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `claim_date` (date, the day of the claim)
      - `amount` (integer, CTY amount claimed)
      - `created_at` (timestamptz)

  2. New Functions
    - `claim_daily_cty` - Allows users to claim 50 CTY per day, max 20 users per day
    - `get_daily_cty_status` - Returns claim status for user

  3. Security
    - Enable RLS on daily_cty_claims table
    - Add policy for users to view their own claims
*/

CREATE TABLE IF NOT EXISTS daily_cty_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  claim_date date NOT NULL DEFAULT CURRENT_DATE,
  amount integer NOT NULL DEFAULT 50,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, claim_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_cty_claims_date ON daily_cty_claims(claim_date);
CREATE INDEX IF NOT EXISTS idx_daily_cty_claims_user ON daily_cty_claims(user_id);

ALTER TABLE daily_cty_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims"
  ON daily_cty_claims
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION claim_daily_cty(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := CURRENT_DATE;
  v_daily_limit integer := 20;
  v_cty_amount integer := 50;
  v_claims_today integer;
  v_already_claimed boolean;
  v_current_balance integer;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM daily_cty_claims
    WHERE user_id = p_user_id AND claim_date = v_today
  ) INTO v_already_claimed;

  IF v_already_claimed THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'You have already claimed your daily CTY',
      'can_claim', false
    );
  END IF;

  SELECT COUNT(*) INTO v_claims_today
  FROM daily_cty_claims
  WHERE claim_date = v_today;

  IF v_claims_today >= v_daily_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Daily limit reached. Try again tomorrow.',
      'can_claim', false,
      'slots_remaining', 0
    );
  END IF;

  INSERT INTO daily_cty_claims (user_id, claim_date, amount)
  VALUES (p_user_id, v_today, v_cty_amount);

  UPDATE user_profiles
  SET cty_balance = COALESCE(cty_balance, 0) + v_cty_amount
  WHERE id = p_user_id
  RETURNING cty_balance INTO v_current_balance;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Successfully claimed ' || v_cty_amount || ' CTY!',
    'amount', v_cty_amount,
    'new_balance', v_current_balance,
    'slots_remaining', v_daily_limit - v_claims_today - 1
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_daily_cty_status(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := CURRENT_DATE;
  v_daily_limit integer := 20;
  v_cty_amount integer := 50;
  v_claims_today integer;
  v_already_claimed boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM daily_cty_claims
    WHERE user_id = p_user_id AND claim_date = v_today
  ) INTO v_already_claimed;

  SELECT COUNT(*) INTO v_claims_today
  FROM daily_cty_claims
  WHERE claim_date = v_today;

  RETURN jsonb_build_object(
    'can_claim', NOT v_already_claimed AND v_claims_today < v_daily_limit,
    'already_claimed', v_already_claimed,
    'slots_remaining', GREATEST(0, v_daily_limit - v_claims_today),
    'amount', v_cty_amount
  );
END;
$$;