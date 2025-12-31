/*
  # Create conversations and messages tables

  1. New Tables
    - `conversations` - Chat threads between users
    - `messages` - Individual messages in conversations
  
  2. Security
    - Enable RLS
    - Users can only see their own conversations
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in own conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );
