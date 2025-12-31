/*
  # Update Garden Whispers for Live Room

  1. Changes
    - Add `expires_at` column for client-side expiration tracking
    - Update cleanup function to delete whispers after 2 minutes
    - Add index on expires_at for efficient cleanup

  2. Purpose
    - Messages now auto-expire after 60-120 seconds
    - Client can filter based on expires_at
    - Cleanup function removes expired messages periodically
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'garden_whispers' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE garden_whispers 
    ADD COLUMN expires_at timestamptz DEFAULT (now() + interval '90 seconds');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_garden_whispers_expires_at 
ON garden_whispers(expires_at);

CREATE OR REPLACE FUNCTION cleanup_old_garden_whispers()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM garden_whispers
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

DELETE FROM garden_whispers WHERE created_at < now() - interval '2 minutes';