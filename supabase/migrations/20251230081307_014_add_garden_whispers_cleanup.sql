/*
  # Add Auto-Cleanup for Garden Whispers

  1. Purpose
    - Automatically delete garden whispers older than 24 hours
    - Keep the garden fresh and ephemeral
    - Reduce storage usage over time

  2. Implementation
    - Creates a function to delete old whispers
    - Note: For production, pair with pg_cron extension or Supabase Edge Function scheduled task

  3. Security
    - Function runs with invoker privileges
    - Only deletes based on created_at timestamp
*/

CREATE OR REPLACE FUNCTION cleanup_old_garden_whispers()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM garden_whispers
  WHERE created_at < now() - interval '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_garden_whispers_created_at 
ON garden_whispers(created_at);
