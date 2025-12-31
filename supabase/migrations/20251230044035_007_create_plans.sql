/*
  # Create plans and user_plans tables

  1. New Tables
    - `plans` - Available subscription plans
    - `user_plans` - User subscriptions
  
  2. Security
    - Enable RLS
    - Anyone can view plans
    - Users can view own plan
*/

CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  daily_image_limit integer DEFAULT 0,
  daily_sound_limit integer DEFAULT 0,
  can_download boolean DEFAULT false,
  can_sell boolean DEFAULT false,
  has_watermark boolean DEFAULT true,
  price_monthly numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
  plan_id uuid NOT NULL REFERENCES plans(id),
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plans"
  ON plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own plan"
  ON user_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can subscribe to plan"
  ON user_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plan"
  ON user_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

INSERT INTO plans (name, description, daily_image_limit, daily_sound_limit, can_download, can_sell, has_watermark, price_monthly) VALUES
  ('free', 'Basic access to Sanctra', 0, 0, false, false, true, 0),
  ('basic', 'Enhanced creation tools', 5, 3, false, false, true, 4.99),
  ('creator', 'Full creative freedom', 20, 10, true, true, false, 14.99);
