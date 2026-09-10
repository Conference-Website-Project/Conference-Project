-- ====================================================================
-- DAY 3 MIGRATION: CONFERENCE PAPER SUBMISSION & PRIVATE PDF STORAGE
-- ====================================================================

-- 1. Sequence & Concurrency-Safe Paper ID Generator Function
CREATE SEQUENCE IF NOT EXISTS public.paper_id_seq START WITH 1;

CREATE OR REPLACE FUNCTION public.generate_paper_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ICARET27-' || LPAD(NEXTVAL('public.paper_id_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- 2. Non-Destructive Column Additions to public.papers
ALTER TABLE public.papers 
  ADD COLUMN IF NOT EXISTS paper_id TEXT DEFAULT public.generate_paper_id();

ALTER TABLE public.papers 
  ADD COLUMN IF NOT EXISTS manuscript_path TEXT;

ALTER TABLE public.papers 
  ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.papers 
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill submitted_by from author_user_id if null
UPDATE public.papers 
SET submitted_by = author_user_id 
WHERE submitted_by IS NULL AND author_user_id IS NOT NULL;

-- Backfill paper_id for existing rows if any
UPDATE public.papers 
SET paper_id = public.generate_paper_id() 
WHERE paper_id IS NULL;

-- Add unique constraint to paper_id if not existing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'papers_paper_id_key'
  ) THEN
    ALTER TABLE public.papers ADD CONSTRAINT papers_paper_id_key UNIQUE (paper_id);
  END IF;
END $$;

-- 3. Non-Destructive Column Additions to public.paper_authors
ALTER TABLE public.paper_authors 
  ADD COLUMN IF NOT EXISTS designation VARCHAR(255);

ALTER TABLE public.paper_authors 
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Seed Conference Tracks for ICARET 2027 (conf-2027-001)
INSERT INTO public.conference_tracks (conference_id, code, name, description)
VALUES
  (
    'conf-2027-001',
    'TRK-01',
    'Artificial Intelligence, Machine Learning & Data Science',
    'Research in AI algorithms, deep learning, computer vision, NLP, and intelligent data systems.'
  ),
  (
    'conf-2027-001',
    'TRK-02',
    'Sustainable Energy Systems & Green Technology',
    'Renewable energy technologies, smart grids, energy efficiency, and sustainable engineering.'
  ),
  (
    'conf-2027-001',
    'TRK-03',
    'Advanced Robotics, Automation & Control Systems',
    'Robotics, autonomous systems, industrial automation, sensing, and control theory.'
  ),
  (
    'conf-2027-001',
    'TRK-04',
    'Next-Generation Communication Networks & Cyber-Physical Systems',
    '5G/6G communication, IoT architectures, cybersecurity, and embedded systems.'
  ),
  (
    'conf-2027-001',
    'TRK-05',
    'Computational Science, VLSI & Embedded Engineering',
    'Semiconductor devices, VLSI design, quantum computing, and high-performance computing.'
  )
ON CONFLICT (conference_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 5. Non-Recursive RLS Policies for public.papers
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Author manage own papers" ON public.papers;
DROP POLICY IF EXISTS "Participants view own papers" ON public.papers;
DROP POLICY IF EXISTS "Participants insert own papers" ON public.papers;
DROP POLICY IF EXISTS "Participants update own submitted papers" ON public.papers;
DROP POLICY IF EXISTS "Admins update any paper" ON public.papers;

CREATE POLICY "Participants view own papers" 
  ON public.papers FOR SELECT
  USING (
    auth.uid() = author_user_id 
    OR auth.uid() = submitted_by 
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Participants insert own papers" 
  ON public.papers FOR INSERT
  WITH CHECK (
    auth.uid() = author_user_id 
    OR auth.uid() = submitted_by 
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Participants update own submitted papers" 
  ON public.papers FOR UPDATE
  USING (
    (auth.uid() = author_user_id OR auth.uid() = submitted_by)
    AND status::text = 'SUBMITTED'
  )
  WITH CHECK (
    (auth.uid() = author_user_id OR auth.uid() = submitted_by)
    AND status::text = 'SUBMITTED'
  );

CREATE POLICY "Admins update any paper" 
  ON public.papers FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- 6. Non-Recursive RLS Policies for public.paper_authors
ALTER TABLE public.paper_authors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Author view paper authors" ON public.paper_authors;
DROP POLICY IF EXISTS "Participants manage own paper authors" ON public.paper_authors;

CREATE POLICY "Participants manage own paper authors" 
  ON public.paper_authors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.papers 
      WHERE papers.id = paper_authors.paper_id 
        AND (papers.author_user_id = auth.uid() OR papers.submitted_by = auth.uid())
    )
    OR public.is_admin(auth.uid())
  );

-- 7. Supabase Private Storage Bucket for Manuscripts
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'paper-manuscripts',
  'paper-manuscripts',
  false, -- Bucket MUST NOT be public
  ARRAY['application/pdf'],
  10485760 -- 10 MB limit
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  allowed_mime_types = ARRAY['application/pdf'],
  file_size_limit = 10485760;

-- Storage RLS Security Policies for paper-manuscripts
DROP POLICY IF EXISTS "Authenticated users upload manuscripts" ON storage.objects;
DROP POLICY IF EXISTS "Users and admins select manuscripts" ON storage.objects;
DROP POLICY IF EXISTS "Users update own manuscripts" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own manuscripts" ON storage.objects;

CREATE POLICY "Authenticated users upload manuscripts" 
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'paper-manuscripts' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users and admins select manuscripts" 
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'paper-manuscripts' AND (
      (storage.foldername(name))[2] = auth.uid()::text 
      OR public.is_admin(auth.uid())
    )
  );

CREATE POLICY "Users update own manuscripts" 
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'paper-manuscripts' 
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Users delete own manuscripts" 
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'paper-manuscripts' 
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
