/*
  # Create Storage Buckets for Profile Media

  1. Storage Buckets
    - `avatars` - For user profile pictures (5MB limit)
    - `covers` - For user cover/banner images (10MB limit)

  2. Security
    - Public read access for displaying images
    - Authenticated users can upload to their own folder
    - Users can only modify their own files
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('avatars', 'avatars', true, 5242880)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('covers', 'covers', true, 10485760)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view covers"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'covers');

CREATE POLICY "Users can upload own cover"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'covers' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own cover"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'covers' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'covers' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own cover"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'covers' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
