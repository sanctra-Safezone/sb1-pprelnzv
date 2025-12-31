/*
  # Create Daily Post Limits System

  1. New Tables
    - `daily_post_counts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `post_date` (date, the date of the posts)
      - `image_count` (integer, number of image posts)
      - `video_count` (integer, number of video posts)
      - `audio_count` (integer, number of audio posts)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `daily_post_counts` table
    - Add policy for users to read their own post counts
    - Add policy for users to insert/update their own post counts

  3. Functions
    - `check_and_increment_post_count`: Checks if user can post and increments count
    - `get_remaining_posts`: Gets remaining posts for user today
*/

CREATE TABLE IF NOT EXISTS daily_post_counts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  post_date date NOT NULL DEFAULT CURRENT_DATE,
  image_count integer NOT NULL DEFAULT 0,
  video_count integer NOT NULL DEFAULT 0,
  audio_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_post_counts_user_date ON daily_post_counts(user_id, post_date);

ALTER TABLE daily_post_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own post counts"
  ON daily_post_counts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own post counts"
  ON daily_post_counts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own post counts"
  ON daily_post_counts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION get_remaining_posts(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_counts daily_post_counts%ROWTYPE;
  v_daily_limit integer := 2;
BEGIN
  SELECT * INTO v_counts
  FROM daily_post_counts
  WHERE user_id = p_user_id AND post_date = CURRENT_DATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'images', v_daily_limit,
      'videos', v_daily_limit,
      'audio', v_daily_limit,
      'can_post', true
    );
  END IF;

  RETURN jsonb_build_object(
    'images', GREATEST(0, v_daily_limit - v_counts.image_count),
    'videos', GREATEST(0, v_daily_limit - v_counts.video_count),
    'audio', GREATEST(0, v_daily_limit - v_counts.audio_count),
    'can_post', (v_counts.image_count < v_daily_limit OR v_counts.video_count < v_daily_limit OR v_counts.audio_count < v_daily_limit)
  );
END;
$$;

CREATE OR REPLACE FUNCTION check_and_increment_post_count(
  p_user_id uuid,
  p_media_type text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_counts daily_post_counts%ROWTYPE;
  v_daily_limit integer := 2;
  v_current_count integer;
  v_column_name text;
BEGIN
  IF p_media_type IS NULL OR p_media_type = '' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Text-only post allowed');
  END IF;

  IF p_media_type NOT IN ('image', 'video', 'audio') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid media type');
  END IF;

  v_column_name := p_media_type || '_count';

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
      'message', 'Daily limit reached for ' || p_media_type || ' posts',
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
$$;
