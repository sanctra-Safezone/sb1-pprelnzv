/*
  # Create post_likes table

  1. New Tables
    - `post_likes`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `user_id` (uuid, references user_profiles)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Anyone can view likes
    - Users can like/unlike posts
*/

CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON post_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
