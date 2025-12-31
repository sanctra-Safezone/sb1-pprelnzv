/*
  # Create comments table

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `user_id` (uuid, references user_profiles)
      - `content` (text)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Anyone can view comments
    - Users can create/delete own comments
*/

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
