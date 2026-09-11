-- ====================================================================
-- MIGRATION 005: SEED ICARET 2027 CONFERENCE TRACKS & RLS POLICIES
-- ====================================================================

-- 1. Ensure RLS Policy allows SELECT for public/participants and ALL for admins
ALTER TABLE public.conference_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read tracks" ON public.conference_tracks;
DROP POLICY IF EXISTS "Admins manage tracks" ON public.conference_tracks;

CREATE POLICY "Public read tracks" 
  ON public.conference_tracks FOR SELECT 
  USING (true);

CREATE POLICY "Admins manage tracks" 
  ON public.conference_tracks FOR ALL 
  USING (public.is_admin(auth.uid()));

-- 2. Non-Destructive / Idempotent Seed Data for ICARET 2027 (conf-2027-001)
INSERT INTO public.conference_tracks (conference_id, code, name, description)
VALUES
  (
    'conf-2027-001',
    'TRK-01',
    'Artificial Intelligence, Data Science & Machine Learning',
    'Neural networks, deep learning, natural language processing, computer vision, trustworthy AI, and intelligent data-driven applications.'
  ),
  (
    'conf-2027-001',
    'TRK-02',
    'Sustainable Systems & Clean Energy',
    'Renewable energy systems, smart cities, eco-friendly materials, energy optimization, and carbon-neutral technologies.'
  ),
  (
    'conf-2027-001',
    'TRK-03',
    'Cyber Security, Networks & Privacy',
    'Cybersecurity, network security, privacy-preserving systems, secure computing, threat detection, and digital trust.'
  ),
  (
    'conf-2027-001',
    'TRK-04',
    'Intelligent Computing, IoT & Emerging Technologies',
    'Internet of Things, edge computing, cloud computing, intelligent embedded systems, distributed computing, and emerging technologies.'
  )
ON CONFLICT (conference_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
