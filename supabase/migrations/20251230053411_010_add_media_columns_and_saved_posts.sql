/*
  # Add media support and saved posts

  1. Changes to `posts` table
    - `video_url` (text) - URL for video content
    - `audio_url` (text) - URL for audio content
    - `media_type` (text) - Type of media: image, video, audio, or null

  2. Changes to `user_profiles` table
    - `profile_sound_url` (text) - URL for profile ambient sound

  3. New Tables
    - `saved_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `post_id` (uuid, references posts)
      - `created_at` (timestamp)
      - Unique constraint on user_id + post_id

  4. Security
    - Enable RLS on `saved_posts` table
    - Users can only manage their own saved posts
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE posts ADD COLUMN video_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'audio_url'
  ) THEN
    ALTER TABLE posts ADD COLUMN audio_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'media_type'
  ) THEN
    ALTER TABLE posts ADD COLUMN media_type text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'profile_sound_url'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN profile_sound_url text;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS saved_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_posts' AND policyname = 'Users can view own saved posts'
  ) THEN
    CREATE POLICY "Users can view own saved posts"
      ON saved_posts FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_posts' AND policyname = 'Users can save posts'
  ) THEN
    CREATE POLICY "Users can save posts"
      ON saved_posts FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_posts' AND policyname = 'Users can unsave posts'
  ) THEN
    CREATE POLICY "Users can unsave posts"
      ON saved_posts FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;
