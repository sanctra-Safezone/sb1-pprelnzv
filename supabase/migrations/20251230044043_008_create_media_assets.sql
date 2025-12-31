/*
  # Create media_assets table for preview content

  1. New Tables
    - `media_assets` - Static preview assets for plans page
  
  2. Security
    - Enable RLS
    - Anyone can view assets
*/

CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('image', 'video', 'sound')),
  url text NOT NULL,
  thumbnail_url text,
  title text,
  description text,
  plan_tier text NOT NULL CHECK (plan_tier IN ('free', 'basic', 'creator')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view media assets"
  ON media_assets FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO media_assets (type, url, thumbnail_url, title, plan_tier) VALUES
  ('image', 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=400', 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=100', 'Abstract Flow', 'basic'),
  ('image', 'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?auto=compress&cs=tinysrgb&w=100', 'Ethereal Light', 'creator'),
  ('image', 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?auto=compress&cs=tinysrgb&w=100', 'Calm Waters', 'creator');
