/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, recipient)
      - `actor_id` (uuid, who triggered it)
      - `type` (text: like, comment, follow, tip)
      - `post_id` (uuid, optional reference)
      - `read_at` (timestamptz)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Users can only see their own notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'tip')),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
