# Conference Management Platform (ICARET 2027)

A reusable, multi-year **Academic Conference Management Platform** built for college institutions to host, organize, and administer annual international conferences.

Designed for long-term maintainability so that conference years (e.g. 2027, 2028), titles, themes, tracks, keynotes, committee members, and registration fees can be managed dynamically from the admin console without modifying source code.

---

## Technical Architecture & Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **UI & Icons**: Lucide React, Custom Academic Design System
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security)
- **Authentication**: Supabase Auth (Google OAuth 2.0 & Email/Password, Role-based access for Participants & Admins)
- **File Storage**: Supabase Storage (Paper PDF manuscripts & speaker assets)
- **Payment Gateway**: Razorpay integration prepared

---

## Day 3A Features — Google Authentication & Multi-Step Onboarding

1. **Google OAuth Authentication**:
   - **"Continue with Google"** primary CTA on `/login` and `/register`.
   - Uses Supabase Auth OAuth (`supabase.auth.signInWithOAuth`).
   - Secure code exchange handler at `/auth/callback`.
2. **Multi-Step Onboarding Wizard (`/onboarding`)**:
   - 5-Step Academic Onboarding (`STEP X OF 5`):
     - **Step 1 — Personal Information**: Full Name & Title (pre-filled from Google profile).
     - **Step 2 — Professional Details**: Institution / University & Designation.
     - **Step 3 — Location & Contact**: Country & Phone Number.
     - **Step 4 — Participation Type**: `AUTHOR` ("Presenting research paper") vs `DELEGATE` ("Attending participant").
     - **Step 5 — Completion**: Summary review & database persistence (`onboarding_completed = true`).
3. **Session Protection & Onboarding Routing Guards**:
   - New Google users automatically route to `/onboarding`.
   - Incomplete profiles attempting to visit `/dashboard` are redirected to `/onboarding`.
   - Completed profiles attempting to visit `/onboarding` are redirected to `/dashboard`.

---

## Supabase Google Provider Setup Guide

To enable **Continue with Google** in your live Supabase project:

1. **Create Google Cloud OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
   - Click **Create Credentials** → **OAuth client ID**.
   - Select Application type: **Web application**.
   - Add Authorized redirect URIs:
     ```
     https://<your-supabase-project-id>.supabase.co/auth/v1/callback
     ```
   - Copy the generated **Client ID** and **Client Secret**.

2. **Enable Google Provider in Supabase**:
   - Go to your [Supabase Dashboard](https://app.supabase.com/) → Select project → **Authentication** → **Providers**.
   - Select **Google** and toggle **Enable Google provider**.
   - Paste your Google **Client ID** and **Client Secret**.
   - Save changes.

3. **Configure URL Settings in Supabase**:
   - In Supabase Dashboard → **Authentication** → **URL Configuration**:
     - Set **Site URL** to `http://localhost:3005` (or your production Vercel domain).
     - Add `http://localhost:3005/**` under **Redirect URLs**.

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
│   │   ├── login/                 # Sign In (Continue with Google primary)
│   │   ├── register/              # Register (Continue with Google primary)
│   │   ├── forgot-password/       # Password reset request form
│   │   ├── auth/callback/         # Supabase OAuth callback route handler
│   │   ├── onboarding/            # 5-Step Academic Onboarding Wizard
│   │   ├── dashboard/             # Protected Participant Portal
│   │   │   └── profile/           # Protected Profile Settings
│   │   └── admin/                 # Protected Admin Control Center
│   │       └── participants/      # Protected Participant Registry
│   ├── components/
│   │   ├── layout/                # Navbar (Dynamic Auth state) & Footer
│   │   ├── providers/             # AuthProvider React Context
│   │   └── ui/                    # Button, Card, Badge, Input, Select, Modal, etc.
│   ├── config/
│   │   └── conference.ts          # Central conference metadata config
│   ├── lib/
│   │   ├── auth.ts                # Auth helper library & OAuth methods
│   │   └── supabase/              # Supabase browser & server clients
│   ├── types/
│   │   └── database.ts            # TypeScript entity models & Profile interfaces
│   └── middleware.ts              # Next.js App Router Auth & Onboarding middleware
├── supabase/
│   └── migrations/
│       ├── 01_initial_schema.sql  # Initial 11-table PostgreSQL schema
│       ├── 002_auth_profiles.sql  # Profiles table, trigger & RLS policies
│       └── 004_google_auth_onboarding.sql # Google OAuth & Onboarding columns
├── .env.example                   # Template environment variables
├── .env.local                     # Local environment configuration
└── README.md                      # Platform documentation
```

---

## Database Migrations

Run these in your Supabase **SQL Editor**:
- [`supabase/migrations/01_initial_schema.sql`](file:///d:/Conference%20project%20website/supabase/migrations/01_initial_schema.sql)
- [`supabase/migrations/002_auth_profiles.sql`](file:///d:/Conference%20project%20website/supabase/migrations/002_auth_profiles.sql)
- [`supabase/migrations/004_google_auth_onboarding.sql`](file:///d:/Conference%20project%20website/supabase/migrations/004_google_auth_onboarding.sql)

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
