# Conference Management Platform

A reusable, multi-year **Academic Conference Management Platform** built for college institutions to host, organize, and administer annual international conferences.

Designed for long-term maintainability so that conference years (e.g. 2027, 2028), titles, themes, tracks, keynotes, committee members, and registration fees can be managed dynamically from the admin console without modifying source code.

---

## Technical Architecture & Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **UI & Icons**: Lucide React, Custom Academic Design System
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security)
- **Authentication**: Supabase Auth (Role-based access for Participants & Admins)
- **File Storage**: Supabase Storage (Paper PDF manuscripts & speaker assets)
- **Payment Gateway**: Razorpay integration prepared

---

## Day 2 Completed Features — Authentication & User Management

1. **Supabase Auth Integration**:
   - Email & Password authentication (`signInWithPassword`, `signUp`, `signOut`, `resetPasswordForEmail`).
   - Human-readable error messages for invalid credentials, duplicate registration, or weak passwords.
2. **User Profile Architecture**:
   - `public.profiles` table linked 1-to-1 with Supabase `auth.users(id)`.
   - Automatic PostgreSQL trigger `handle_new_user()` populates user profiles upon signup.
3. **Role Architecture & RLS Security**:
   - Roles: `PARTICIPANT` (default) and `ADMIN`.
   - Client registration is strictly defaulted to `PARTICIPANT` on the server/database side. The client cannot elevate to `ADMIN`.
   - Row Level Security (RLS) policies enforce user self-editing and restrict non-admin access to admin data.
4. **Session Protection & Middleware**:
   - Next.js App Router `middleware.ts` protects `/dashboard`, `/dashboard/profile`, `/admin`, and `/admin/participants`.
   - Non-admin users attempting to visit `/admin` are denied and redirected to `/dashboard`.
   - Authenticated users attempting to visit `/login` or `/register` are redirected to `/dashboard`.
5. **Participant & Admin Dashboards**:
   - `/dashboard/profile`: Editable profile form (Full Name, Phone, Institution, Designation, Country) with read-only email.
   - `/admin/participants`: Registered user registry featuring search filter by name, email, or institution.

---

## Project Structure

```
d:/Conference project website/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Public Homepage (9 Academic Sections)
│   │   ├── about/                 # Conference scope & governance
│   │   ├── call-for-papers/       # Research tracks & author templates
│   │   ├── important-dates/       # Submission timeline schedule
│   │   ├── speakers/              # Keynote scholar profiles
│   │   ├── committee/             # Organizing & technical committee
│   │   ├── program/               # Technical paper presentation schedule
│   │   ├── registration/          # Delegate fee categories
│   │   ├── venue/                 # Travel & accommodation guide
│   │   ├── contact/               # Conference secretariat helpdesk
│   │   ├── login/                 # Author & admin login (Connected to Auth)
│   │   ├── register/              # Participant registration (Connected to Auth)
│   │   ├── forgot-password/       # Password reset request form
│   │   ├── dashboard/             # Protected Participant Portal
│   │   │   └── profile/           # Protected Profile Settings (Editable)
│   │   └── admin/                 # Protected Admin Control Center
│   │       └── participants/      # Protected Participant User Management
│   ├── components/
│   │   ├── layout/                # Navbar (Dynamic Auth state) & Footer
│   │   ├── providers/             # AuthProvider React Context
│   │   └── ui/                    # Button, Card, Badge, SectionHeading, Input, etc.
│   ├── config/
│   │   └── conference.ts          # Central conference metadata config
│   ├── lib/
│   │   ├── auth.ts                # Auth helper library & local session fallback
│   │   └── supabase/              # Supabase browser & server clients
│   ├── types/
│   │   └── database.ts            # TypeScript entity models & Profile interfaces
│   └── middleware.ts              # Next.js App Router Auth middleware
├── supabase/
│   └── migrations/
│       ├── 01_initial_schema.sql  # Initial 11-table PostgreSQL schema
│       └── 002_auth_profiles.sql  # Day 2 profiles table, trigger & RLS policies
├── .env.example                   # Template environment variables
├── .env.local                     # Local environment configuration
└── README.md                      # Platform documentation
```

---

## Database Architecture (PostgreSQL Schema)

The database is designed around a central `conferences` entity so that multiple annual editions can coexist without code duplication.

### Primary Entities:
1. `conferences` — Central entity (year, title, theme, dates, venue, settings)
2. `profiles` — Extends Supabase `auth.users` with roles (`ADMIN`, `PARTICIPANT`, `REVIEWER`, `CHAIR`)
3. `conference_tracks` — Technical research tracks
4. `important_dates` — Event deadlines and timeline
5. `speakers` — Keynote speaker profiles
6. `committee_members` — Patrons and technical chairs
7. `papers` — Double-blind manuscript submissions
8. `paper_authors` — Co-authors list for manuscripts
9. `registrations` — Delegate registrations
10. `payments` — Transaction logs (Razorpay ready)
11. `announcements` — Official notice board bulletins

Migration SQL files:
- Initial Schema: [`supabase/migrations/01_initial_schema.sql`](file:///d:/Conference%20project%20website/supabase/migrations/01_initial_schema.sql)
- Auth Profiles & RLS: [`supabase/migrations/002_auth_profiles.sql`](file:///d:/Conference%20project%20website/supabase/migrations/002_auth_profiles.sql)

---

## How Admin Access Works

1. Users registering via `/register` are automatically assigned `role = 'PARTICIPANT'` by the database trigger `handle_new_user()`.
2. Admin privileges (`role = 'ADMIN'`) must be granted through a controlled database process:
   ```sql
   UPDATE public.profiles
   SET role = 'ADMIN'
   WHERE email = 'admin@college.edu';
   ```
3. When an `ADMIN` user logs in, the middleware and `AuthProvider` grant access to `/admin` and `/admin/participants`.

---

## Environment Variables & Supabase Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in your Supabase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_CONFERENCE_ID=conf-2027-001
   NEXT_PUBLIC_APP_URL=http://localhost:3005
   ```

---

## Local Development & Testing Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run local development server (port 3005):
   ```bash
   npm run dev -- -p 3005
   ```
   Open [http://localhost:3005](http://localhost:3005) in your browser.

3. Type-check TypeScript:
   ```bash
   npx tsc --noEmit
   ```

4. Build production bundle:
   ```bash
   npm run build
   ```
