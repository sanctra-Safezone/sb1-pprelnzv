/*
  # Create follows table

  1. New Tables
    - `follows` - User follow relationships
  
  2. Security
    - Enable RLS
    - Anyone can view follows
    - Users can follow/unfollow
*/

CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows"
  ON follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can follow"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);
