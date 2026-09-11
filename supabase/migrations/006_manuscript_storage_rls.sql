-- Migration 006: Fix Supabase Storage RLS Policies & Remove File Size Limit for Private paper-manuscripts Bucket

-- 1. Ensure private 'paper-manuscripts' bucket exists with NO file size limit
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'paper-manuscripts',
  'paper-manuscripts',
  false, -- PRIVATE BUCKET
  ARRAY['application/pdf'],
  NULL -- NO file size limit (unrestricted file size)
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  allowed_mime_types = ARRAY['application/pdf'],
  file_size_limit = NULL;

-- 2. Clean up existing storage RLS policies for paper-manuscripts
DROP POLICY IF EXISTS "Authenticated users upload manuscripts" ON storage.objects;
DROP POLICY IF EXISTS "Users upload own manuscripts" ON storage.objects;
DROP POLICY IF EXISTS "Users and admins select manuscripts" ON storage.objects;
DROP POLICY IF EXISTS "Users update own manuscripts" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own manuscripts" ON storage.objects;

-- 3. Create robust, permissive-per-owner Storage RLS policies for paper-manuscripts

-- INSERT: Authenticated participants can upload PDF manuscripts under their user ID path
CREATE POLICY "Users upload own manuscripts" 
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'paper-manuscripts' 
    AND auth.role() = 'authenticated'
    AND (
      (storage.foldername(name))[2] = auth.uid()::text
      OR (storage.foldername(name))[1] = auth.uid()::text
      OR name LIKE '%/' || auth.uid()::text || '/%'
      OR name LIKE auth.uid()::text || '/%'
    )
  );

-- SELECT: Participants can access their own uploaded manuscripts; Admins can access all manuscripts
CREATE POLICY "Users and admins select manuscripts" 
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'paper-manuscripts' 
    AND (
      (storage.foldername(name))[2] = auth.uid()::text
      OR (storage.foldername(name))[1] = auth.uid()::text
      OR name LIKE '%/' || auth.uid()::text || '/%'
      OR name LIKE auth.uid()::text || '/%'
      OR public.is_admin(auth.uid())
    )
  );

-- UPDATE: Participants can update/replace their own uploaded manuscripts (required for upsert)
CREATE POLICY "Users update own manuscripts" 
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'paper-manuscripts' 
    AND (
      (storage.foldername(name))[2] = auth.uid()::text
      OR (storage.foldername(name))[1] = auth.uid()::text
      OR name LIKE '%/' || auth.uid()::text || '/%'
      OR name LIKE auth.uid()::text || '/%'
      OR public.is_admin(auth.uid())
    )
  );

-- DELETE: Participants can delete their own uploaded manuscripts
CREATE POLICY "Users delete own manuscripts" 
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'paper-manuscripts' 
    AND (
      (storage.foldername(name))[2] = auth.uid()::text
      OR (storage.foldername(name))[1] = auth.uid()::text
      OR name LIKE '%/' || auth.uid()::text || '/%'
      OR name LIKE auth.uid()::text || '/%'
      OR public.is_admin(auth.uid())
    )
  );
