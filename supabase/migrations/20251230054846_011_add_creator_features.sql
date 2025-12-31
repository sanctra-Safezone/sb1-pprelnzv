/*
  # Add Creator Features

  1. Modified Tables
    - `user_profiles`
      - `creator_tags` (text array) - Art, Sound, Writing, Video
      - `store_enabled` (boolean) - Whether store mode is active
      - `cty_level` (integer) - Visual CTY level based on activity

  2. New Tables
    - `gallery_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `title` (text) - Item title
      - `type` (text) - image, video, sound
      - `media_url` (text) - URL to the media
      - `thumbnail_url` (text) - Optional thumbnail
      - `for_sale` (boolean) - Whether item is for sale
      - `cty_price` (integer) - Price in CTY (5-100)
      - `created_at` (timestamp)

  3. Security
    - Enable RLS on gallery_items
    - Add policies for authenticated users
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'creator_tags'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN creator_tags text[] DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'store_enabled'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN store_enabled boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'cty_level'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN cty_level integer DEFAULT 1;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT '',
  type text NOT NULL CHECK (type IN ('image', 'video', 'sound')),
  media_url text NOT NULL,
  thumbnail_url text,
  for_sale boolean DEFAULT false,
  cty_price integer DEFAULT 0 CHECK (cty_price >= 0 AND cty_price <= 100),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view gallery items'
  ) THEN
    CREATE POLICY "Anyone can view gallery items"
      ON gallery_items
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own gallery items'
  ) THEN
    CREATE POLICY "Users can insert own gallery items"
      ON gallery_items
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own gallery items'
  ) THEN
    CREATE POLICY "Users can update own gallery items"
      ON gallery_items
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own gallery items'
  ) THEN
    CREATE POLICY "Users can delete own gallery items"
      ON gallery_items
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_gallery_items_user_id ON gallery_items(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_items_type ON gallery_items(type);
CREATE INDEX IF NOT EXISTS idx_gallery_items_created_at ON gallery_items(created_at DESC);
