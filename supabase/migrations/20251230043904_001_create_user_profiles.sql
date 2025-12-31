/*
  # Create user_profiles table

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `display_name` (text)
      - `bio` (text)
      - `avatar_url` (text)
      - `cover_url` (text)
      - `cty_balance` (integer, default 50)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Users can read any profile
    - Users can only update their own profile
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text,
  bio text DEFAULT '',
  avatar_url text,
  cover_url text,
  cty_balance integer DEFAULT 50 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
