/*
  # Create Posts Media Storage Bucket

  1. Storage
    - Creates 'posts' bucket for post media (images, videos, audio)
    - 20MB limit to accommodate videos

  2. Security
    - Public read access for displaying content
    - Authenticated users can upload to their own folder
    - Users can only delete their own files
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'posts', 'posts', true, 20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'audio/mp3']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'posts'
);

DROP POLICY IF EXISTS "Anyone can view posts media" ON storage.objects;
CREATE POLICY "Anyone can view posts media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'posts');

DROP POLICY IF EXISTS "Users can upload own posts media" ON storage.objects;
CREATE POLICY "Users can upload own posts media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete own posts media" ON storage.objects;
CREATE POLICY "Users can delete own posts media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
