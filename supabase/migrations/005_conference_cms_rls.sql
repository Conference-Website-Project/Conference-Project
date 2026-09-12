-- ====================================================================
-- DAY 3 MIGRATION: CONFERENCE CMS ROW LEVEL SECURITY (RLS) & POLICIES
-- ====================================================================

-- Ensure is_admin helper function exists
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 1. Conferences Table RLS Policies
ALTER TABLE public.conferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read conferences" ON public.conferences;
CREATE POLICY "Public read conferences" ON public.conferences 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage conferences" ON public.conferences;
CREATE POLICY "Admins manage conferences" ON public.conferences 
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 2. Conference Tracks Table RLS Policies
ALTER TABLE public.conference_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read tracks" ON public.conference_tracks;
CREATE POLICY "Public read tracks" ON public.conference_tracks 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage tracks" ON public.conference_tracks;
CREATE POLICY "Admins manage tracks" ON public.conference_tracks 
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 3. Important Dates Table RLS Policies
ALTER TABLE public.important_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read important dates" ON public.important_dates;
CREATE POLICY "Public read important dates" ON public.important_dates 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage important dates" ON public.important_dates;
CREATE POLICY "Admins manage important dates" ON public.important_dates 
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 4. Speakers Table RLS Policies
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read speakers" ON public.speakers;
CREATE POLICY "Public read speakers" ON public.speakers 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage speakers" ON public.speakers;
CREATE POLICY "Admins manage speakers" ON public.speakers 
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 5. Committee Members Table RLS Policies
ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read committee" ON public.committee_members;
CREATE POLICY "Public read committee" ON public.committee_members 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage committee" ON public.committee_members;
CREATE POLICY "Admins manage committee" ON public.committee_members 
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 6. Announcements Table RLS Policies
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read announcements" ON public.announcements;
CREATE POLICY "Public read announcements" ON public.announcements 
  FOR SELECT USING (is_published = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage announcements" ON public.announcements;
CREATE POLICY "Admins manage announcements" ON public.announcements 
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Seed Default Speakers if table is empty
INSERT INTO public.speakers (conference_id, name, title, affiliation, bio, topic, display_order)
SELECT 
  'conf-2027-001',
  'Prof. Eleanor Vance',
  'Professor of Computer Science & AI Ethics',
  'Institute for Advanced Studies, UK',
  'Leading researcher in ethical AI systems and trustworthy machine learning models.',
  'Responsible AI Architecture in Next-Generation Systems',
  1
WHERE NOT EXISTS (SELECT 1 FROM public.speakers);

INSERT INTO public.speakers (conference_id, name, title, affiliation, bio, topic, display_order)
SELECT 
  'conf-2027-001',
  'Dr. Rajesh K. Sharma',
  'Senior Principal Scientist',
  'National Renewable Energy Laboratory',
  'Pioneer in smart grid integration and sustainable microgrid energy distribution.',
  'Decentralized Smart Grids: Path to Net-Zero Cities',
  2
WHERE NOT EXISTS (SELECT 1 FROM public.speakers WHERE name = 'Dr. Rajesh K. Sharma');

INSERT INTO public.speakers (conference_id, name, title, affiliation, bio, topic, display_order)
SELECT 
  'conf-2027-001',
  'Dr. Sophia Chen',
  'Director of Quantum Computing Research',
  'Tech Research Alliance, Singapore',
  'Pioneer in post-quantum cryptography and cloud infrastructure resilience.',
  'Securing Distributed Systems in the Quantum Era',
  3
WHERE NOT EXISTS (SELECT 1 FROM public.speakers WHERE name = 'Dr. Sophia Chen');

-- Seed Default Important Dates if table is empty
INSERT INTO public.important_dates (conference_id, title, date_value, highlight, display_order)
SELECT 'conf-2027-001', 'Full Paper Submission Deadline', 'December 15, 2026', true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.important_dates);

INSERT INTO public.important_dates (conference_id, title, date_value, highlight, display_order)
SELECT 'conf-2027-001', 'Notification of Acceptance', 'February 10, 2027', false, 2
WHERE NOT EXISTS (SELECT 1 FROM public.important_dates WHERE title = 'Notification of Acceptance');

INSERT INTO public.important_dates (conference_id, title, date_value, highlight, display_order)
SELECT 'conf-2027-001', 'Camera-Ready Paper Submission', 'March 01, 2027', false, 3
WHERE NOT EXISTS (SELECT 1 FROM public.important_dates WHERE title = 'Camera-Ready Paper Submission');

INSERT INTO public.important_dates (conference_id, title, date_value, highlight, display_order)
SELECT 'conf-2027-001', 'Early Bird Registration Deadline', 'March 15, 2027', true, 4
WHERE NOT EXISTS (SELECT 1 FROM public.important_dates WHERE title = 'Early Bird Registration Deadline');

INSERT INTO public.important_dates (conference_id, title, date_value, highlight, display_order)
SELECT 'conf-2027-001', 'Main Conference Dates', 'April 15–17, 2027', true, 5
WHERE NOT EXISTS (SELECT 1 FROM public.important_dates WHERE title = 'Main Conference Dates');

-- Seed Default Committee Members if table is empty
INSERT INTO public.committee_members (conference_id, name, role, affiliation, category, display_order)
SELECT 'conf-2027-001', 'Dr. A. K. Sundaram', 'Chief Patron', 'Principal, College of Engineering', 'patron'::committee_category, 1
WHERE NOT EXISTS (SELECT 1 FROM public.committee_members);

INSERT INTO public.committee_members (conference_id, name, role, affiliation, category, display_order)
SELECT 'conf-2027-001', 'Prof. Meera Deshmukh', 'General Conference Chair', 'Head of Computer Science', 'chair'::committee_category, 2
WHERE NOT EXISTS (SELECT 1 FROM public.committee_members WHERE name = 'Prof. Meera Deshmukh');

INSERT INTO public.committee_members (conference_id, name, role, affiliation, category, display_order)
SELECT 'conf-2027-001', 'Dr. Robert Miller', 'Technical Program Chair', 'Dept. of Electrical Engineering', 'chair'::committee_category, 3
WHERE NOT EXISTS (SELECT 1 FROM public.committee_members WHERE name = 'Dr. Robert Miller');

INSERT INTO public.committee_members (conference_id, name, role, affiliation, category, display_order)
SELECT 'conf-2027-001', 'Dr. S. Ramanathan', 'Organizing Secretary', 'Dept. of Information Technology', 'organizing'::committee_category, 4
WHERE NOT EXISTS (SELECT 1 FROM public.committee_members WHERE name = 'Dr. S. Ramanathan');

-- Seed Default Announcements if table is empty
INSERT INTO public.announcements (conference_id, title, content, is_published)
SELECT 
  'conf-2027-001',
  'Call for Papers Now Open for ICARET 2027',
  'We are excited to announce that paper submissions are officially open across all five technical tracks. Authors are invited to submit original manuscripts before December 15, 2026.',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.announcements);
