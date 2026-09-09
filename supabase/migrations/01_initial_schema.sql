-- ====================================================================
-- REUSABLE ACADEMIC CONFERENCE MANAGEMENT PLATFORM SCHEMA
-- Designed for Multi-Year Administration (2027+)
-- ====================================================================

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'PARTICIPANT', 'REVIEWER', 'CHAIR');
CREATE TYPE paper_status AS ENUM (
  'SUBMITTED', 
  'UNDER_REVIEW', 
  'REVISION_REQUESTED', 
  'ACCEPTED', 
  'REJECTED', 
  'CAMERA_READY_SUBMITTED'
);
CREATE TYPE registration_category AS ENUM (
  'STUDENT', 
  'FACULTY', 
  'INDUSTRY', 
  'ATTENDEE_ONLY'
);
CREATE TYPE payment_status AS ENUM (
  'PENDING', 
  'SUCCESSFUL', 
  'FAILED', 
  'REFUNDED'
);
CREATE TYPE committee_category AS ENUM (
  'patron', 
  'chair', 
  'organizing', 
  'technical'
);

-- 2. Create Users Profile Table (Extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  affiliation VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  role user_role NOT NULL DEFAULT 'PARTICIPANT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Central Conferences Table
CREATE TABLE public.conferences (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(64) NOT NULL,
  year INT NOT NULL CHECK (year >= 2020),
  theme TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (end_date >= start_date),
  institution VARCHAR(255) NOT NULL,
  venue VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  registration_open BOOLEAN NOT NULL DEFAULT TRUE,
  paper_submission_open BOOLEAN NOT NULL DEFAULT TRUE,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Conference Tracks Table
CREATE TABLE public.conference_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id VARCHAR(64) NOT NULL REFERENCES public.conferences(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(conference_id, code)
);

-- 5. Create Important Dates Table
CREATE TABLE public.important_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id VARCHAR(64) NOT NULL REFERENCES public.conferences(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  date_value VARCHAR(100) NOT NULL,
  highlight BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create Speakers Table
CREATE TABLE public.speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id VARCHAR(64) NOT NULL REFERENCES public.conferences(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  affiliation VARCHAR(255) NOT NULL,
  bio TEXT,
  topic VARCHAR(255) NOT NULL,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Create Committee Members Table
CREATE TABLE public.committee_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id VARCHAR(64) NOT NULL REFERENCES public.conferences(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  affiliation VARCHAR(255) NOT NULL,
  category committee_category NOT NULL DEFAULT 'organizing',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Create Papers Table
CREATE TABLE public.papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id VARCHAR(64) NOT NULL REFERENCES public.conferences(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.conference_tracks(id) ON DELETE RESTRICT,
  author_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  abstract TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  file_url TEXT,
  status paper_status NOT NULL DEFAULT 'SUBMITTED',
  submission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Create Paper Authors Table
CREATE TABLE public.paper_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID NOT NULL REFERENCES public.papers(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  affiliation VARCHAR(255) NOT NULL,
  is_corresponding BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0
);

-- 10. Create Registrations Table
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id VARCHAR(64) NOT NULL REFERENCES public.conferences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category registration_category NOT NULL,
  amount_due NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  paper_id UUID REFERENCES public.papers(id) ON DELETE SET NULL,
  dietary_requirements VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(conference_id, user_id)
);

-- 11. Create Payments Table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  status payment_status NOT NULL DEFAULT 'PENDING',
  transaction_reference VARCHAR(255),
  gateway_payment_id VARCHAR(255),
  payment_method VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Create Announcements Table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id VARCHAR(64) NOT NULL REFERENCES public.conferences(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- ====================================================================
CREATE INDEX idx_tracks_conference ON public.conference_tracks(conference_id);
CREATE INDEX idx_important_dates_conf ON public.important_dates(conference_id, display_order);
CREATE INDEX idx_speakers_conf ON public.speakers(conference_id, display_order);
CREATE INDEX idx_committee_conf ON public.committee_members(conference_id, category);
CREATE INDEX idx_papers_conference ON public.papers(conference_id, author_user_id);
CREATE INDEX idx_papers_track ON public.papers(track_id);
CREATE INDEX idx_registrations_conf_user ON public.registrations(conference_id, user_id);
CREATE INDEX idx_payments_registration ON public.payments(registration_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) STRATEGY
-- ====================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conference_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.important_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Public Read Access Policies (Public content readable by anyone)
CREATE POLICY "Public read conferences" ON public.conferences FOR SELECT USING (true);
CREATE POLICY "Public read tracks" ON public.conference_tracks FOR SELECT USING (true);
CREATE POLICY "Public read important dates" ON public.important_dates FOR SELECT USING (true);
CREATE POLICY "Public read speakers" ON public.speakers FOR SELECT USING (true);
CREATE POLICY "Public read committee" ON public.committee_members FOR SELECT USING (true);
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (is_published = true);

-- User Self-Access Policies
CREATE POLICY "User view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "User update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Author manage own papers" ON public.papers FOR ALL USING (auth.uid() = author_user_id);
CREATE POLICY "Author view paper authors" ON public.paper_authors FOR ALL USING (
  EXISTS (SELECT 1 FROM public.papers WHERE papers.id = paper_authors.paper_id AND papers.author_user_id = auth.uid())
);

CREATE POLICY "User manage own registrations" ON public.registrations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User manage own payments" ON public.payments FOR ALL USING (auth.uid() = user_id);

-- Seed Default Conference (ICARET 2027)
INSERT INTO public.conferences (
  id, name, short_name, year, theme, description, start_date, end_date,
  institution, venue, city, state, country, contact_email, contact_phone,
  registration_open, paper_submission_open
) VALUES (
  'conf-2027-001',
  'International Conference on Advanced Research in Engineering and Technology',
  'ICARET 2027',
  2027,
  'Empowering Next-Generation Sustainable Systems and Artificial Intelligence',
  'Premier international forum for engineering and computational research.',
  '2027-04-15',
  '2027-04-17',
  'College of Engineering & Technology',
  'Main Auditorium & Conference Complex',
  'New Delhi',
  'Delhi',
  'India',
  'icaret2027@college.edu',
  '+91 11 2345 6789',
  TRUE,
  TRUE
) ON CONFLICT (id) DO NOTHING;
