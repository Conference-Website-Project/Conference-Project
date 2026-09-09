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
│   │   ├── login/                 # Author & admin login
│   │   ├── register/              # Participant registration portal
│   │   ├── dashboard/             # Author & delegate portal
│   │   └── admin/                 # Admin control center
│   ├── components/
│   │   ├── layout/                # Responsive Navbar & Footer
│   │   └── ui/                    # Button, Card, Badge, SectionHeading, Input, Modal, etc.
│   ├── config/
│   │   └── conference.ts          # Central conference metadata config
│   ├── lib/
│   │   └── supabase/              # Supabase browser & server clients
│   └── types/
│       └── database.ts            # TypeScript entity models & enums
├── supabase/
│   └── migrations/
│       └── 01_initial_schema.sql  # Complete 11-table PostgreSQL migration schema
├── .env.example                   # Template environment variables
├── .env.local                     # Local environment configuration
└── README.md                      # Platform documentation
```

---

## Database Architecture (PostgreSQL Schema)

The database is designed around a central `conferences` entity so that multiple annual editions can coexist without code duplication.

### Primary Entities:
1. `conferences` — Central entity (year, title, theme, dates, venue, settings)
2. `users` — Extends Supabase `auth.users` with roles (`ADMIN`, `PARTICIPANT`, `REVIEWER`, `CHAIR`)
3. `conference_tracks` — Technical research tracks
4. `important_dates` — Event deadlines and timeline
5. `speakers` — Keynote speaker profiles
6. `committee_members` — Patrons and technical chairs
7. `papers` — Double-blind manuscript submissions
8. `paper_authors` — Co-author list for manuscripts
9. `registrations` — Delegate registrations
10. `payments` — Transaction logs (Razorpay ready)
11. `announcements` — Official notice board bulletins

Migration SQL is located at [`supabase/migrations/01_initial_schema.sql`](file:///d:/Conference%20project%20website/supabase/migrations/01_initial_schema.sql).

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
   ```

---

## Local Development Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. Type-check TypeScript:
   ```bash
   npx tsc --noEmit
   ```

4. Build production bundle:
   ```bash
   npm run build
   ```

---

## Git Workflow & Security Rules

- Secret keys (`.env.local`, API credentials) are excluded via `.gitignore`.
- Database access is protected with Row Level Security (RLS) policies.
