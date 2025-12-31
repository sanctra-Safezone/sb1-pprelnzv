/*
  # Add UPDATE policy for messages

  1. Security Changes
    - Add UPDATE policy so users can mark messages as read in their conversations
    - Only allows updating for messages they are part of

  2. Notes
    - Required for read receipts functionality
    - Users can only update messages in conversations they are part of
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
    AND policyname = 'Users can update messages in own conversations'
  ) THEN
    CREATE POLICY "Users can update messages in own conversations"
      ON messages
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM conversations c
          WHERE c.id = messages.conversation_id
          AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM conversations c
          WHERE c.id = messages.conversation_id
          AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
        )
      );
  END IF;
END $$;