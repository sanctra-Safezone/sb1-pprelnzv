/*
  # Create Garden Whispers Table

  1. New Tables
    - `garden_whispers`
      - `id` (uuid, primary key)
      - `content` (text, max 120 chars - short whispers only)
      - `alias` (text - soft anonymous name)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `garden_whispers` table
    - All authenticated users can read all whispers
    - Authenticated users can insert their own whispers
    - No updates or deletes allowed (whispers are immutable)

  3. Notes
    - This is a global sanctuary - not a chat room
    - Messages are anonymous with soft aliases
    - No profiles, likes, or replies
*/

CREATE TABLE IF NOT EXISTS garden_whispers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL CHECK (char_length(content) <= 120),
  alias text NOT NULL DEFAULT 'wanderer',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE garden_whispers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read whispers"
  ON garden_whispers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create whispers"
  ON garden_whispers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_garden_whispers_created_at 
  ON garden_whispers(created_at DESC);
