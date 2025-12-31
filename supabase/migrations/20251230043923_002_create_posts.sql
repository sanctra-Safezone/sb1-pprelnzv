/*
  # Create posts table

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `content` (text)
      - `image_url` (text, optional)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Anyone can read posts
    - Users can create/delete their own posts
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
