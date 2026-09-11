-- ====================================================================
-- MIGRATION 005: SEED ICARET 2027 CONFERENCE TRACKS & RLS POLICIES
-- ====================================================================

-- 1. Ensure RLS Policy allows admins to manage tracks
ALTER TABLE public.conference_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read tracks" ON public.conference_tracks;
DROP POLICY IF EXISTS "Admins manage tracks" ON public.conference_tracks;

CREATE POLICY "Public read tracks" 
  ON public.conference_tracks FOR SELECT 
  USING (true);

CREATE POLICY "Admins manage tracks" 
  ON public.conference_tracks FOR ALL 
  USING (public.is_admin(auth.uid()));

-- 2. Non-Destructive Seed Data for ICARET 2027 (conf-2027-001)
INSERT INTO public.conference_tracks (conference_id, code, name, description)
VALUES
  (
    'conf-2027-001',
    'TRK-01',
    'Artificial Intelligence, Data Science & Machine Learning',
    'Research in AI algorithms, data science, neural networks, deep learning, NLP, and machine learning architectures.'
  ),
  (
    'conf-2027-001',
    'TRK-02',
    'Sustainable Systems & Clean Energy',
    'Renewable energy technologies, smart grids, sustainable engineering, energy efficiency, and green technology.'
  ),
  (
    'conf-2027-001',
    'TRK-03',
    'Cyber Security, Networks & Privacy',
    'Cybersecurity, network protocols, cryptography, privacy-preserving systems, 5G/6G, and cloud security.'
  ),
  (
    'conf-2027-001',
    'TRK-04',
    'Intelligent Computing, IoT & Emerging Technologies',
    'Internet of Things (IoT), edge computing, embedded systems, quantum computing, and emerging computational paradigms.'
  )
ON CONFLICT (conference_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
