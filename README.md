# 🚨 CrimeReport – Crime Complaint Reporting Platform

A production-ready, full-stack crime complaint registration and tracking platform built with **Next.js 16**, **Supabase**, **TailwindCSS v4**, and **Leaflet.js**.

---

## 📐 System Architecture

```
Browser (Next.js / React)
  │
  ├── Public Pages
  │   ├── / (Homepage)
  │   ├── /complaint (Complaint Registration Form)
  │   ├── /track (Complaint Tracking Page)
  │   └── /map (Live Leaflet Map)
  │
  ├── Admin Pages (session-protected)
  │   ├── /admin/login
  │   ├── /admin (Dashboard – complaint list + filters + status update)
  │   └── /admin/map (Admin Leaflet Map)
  │
  └── API Routes (Next.js App Router)
      ├── POST /api/complaints          → Submit new complaint + Email
      ├── GET  /api/complaints          → List all (with filters)
      ├── GET  /api/complaints/[id]     → Get complaint + images by ID
      ├── PATCH /api/complaints/[id]    → Update status (admin)
      ├── POST /api/admin/login         → Admin login → session cookie
      └── POST /api/admin/logout        → Clear session cookie

Supabase (PostgreSQL)
  ├── complaints table
  ├── complaint_images table
  ├── status_updates table
  └── admins table

Supabase Storage
  └── complaint-images bucket

Nodemailer + Gmail
  └── Confirmation email on complaint submission
```

---

## 🛠️ Technology Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 16, React 19, TailwindCSS v4 |
| Backend    | Next.js API Routes (App Router)      |
| Database   | Supabase (PostgreSQL)                |
| Auth       | Custom JWT (bcrypt + jose) + httpOnly session cookie |
| Storage    | Supabase Storage                     |
| Map        | Leaflet.js + react-leaflet           |
| Email      | Nodemailer + Gmail                   |
| Language   | TypeScript                           |

---

## 🗃️ Database Schema

See [`database/schema.sql`](./database/schema.sql) for the full Supabase SQL schema.

**Tables:**
- `complaints` – core complaint records
- `complaint_images` – file references for uploaded images
- `status_updates` – audit log of status changes
- `admins` – admin accounts with bcrypt-hashed passwords and role-based access

---

## 📁 Folder Structure

```
/
├── app/
│   ├── page.tsx                   # Public homepage
│   ├── layout.tsx                 # Root layout
│   ├── globals.css                # Global styles + Leaflet CSS
│   ├── complaint/page.tsx         # Complaint registration form
│   ├── track/page.tsx             # Complaint tracking page
│   ├── map/page.tsx               # Public live map
│   ├── admin/
│   │   ├── login/page.tsx         # Admin login
│   │   ├── page.tsx               # Admin dashboard
│   │   └── map/page.tsx           # Admin map view
│   └── api/
│       ├── complaints/route.ts    # GET all / POST new complaint
│       ├── complaints/[id]/route.ts # GET by ID / PATCH status
│       ├── admin/login/route.ts   # Admin login endpoint
│       └── admin/logout/route.ts  # Admin logout endpoint
├── components/
│   ├── LiveMap.tsx                # Leaflet map with color-coded markers
│   └── MiniMap.tsx                # Single-location mini map
├── lib/
│   ├── supabase.ts                # Supabase browser client
│   ├── supabase-server.ts         # Supabase server client (service role)
│   └── utils.ts                   # Shared utilities
├── types/
│   └── index.ts                   # TypeScript type definitions
├── database/
│   ├── schema.sql                 # Supabase SQL schema
│   └── migrations/
│       └── 001_admins_table.md    # Admins table migration + setup guide
└── .env.local.example             # Environment variable template
```

---

## ⚙️ Supabase Setup Instructions

1. Go to [supabase.com](https://supabase.com) and create a new project.

2. In **SQL Editor**, run the contents of [`database/schema.sql`](./database/schema.sql).

3. In **SQL Editor**, run the admins table migration from [`database/migrations/001_admins_table.md`](./database/migrations/001_admins_table.md):

   **Step 3a – Create the `admins` table:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   CREATE TABLE IF NOT EXISTS admins (
     id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name          TEXT NOT NULL,
     phone         TEXT UNIQUE NOT NULL,
     password_hash TEXT NOT NULL,
     role          TEXT NOT NULL DEFAULT 'admin'
                   CHECK (role IN ('admin', 'superadmin')),
     created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );

   ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Service role manages admins"
     ON admins FOR ALL
     TO service_role
     USING (true)
     WITH CHECK (true);

   CREATE INDEX IF NOT EXISTS idx_admins_phone ON admins(phone);
   ```

   **Step 3b – Insert your first admin** (see the [Admin Management](#-admin-management) section below for details).

4. **Add the `email` column** to the `complaints` table (run in **SQL Editor**):

   ```sql
   ALTER TABLE complaints ADD COLUMN IF NOT EXISTS email TEXT;
   ```

5. In **Storage > Buckets**, create a bucket named **`complaint-images`** and set it to **Public**.

5. Add Storage policies (or run the commented-out SQL at the bottom of `schema.sql`):
   - Allow anonymous uploads to `complaint-images`
   - Allow public reads from `complaint-images`

6. Copy your credentials from **Project Settings > API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 📦 Install Dependencies

```bash
npm install
```

---

## 🔐 Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT secret for signing admin session tokens (min 32 characters)
# Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=replace_this_with_a_long_random_secret_at_least_32_chars

# Gmail (Nodemailer) – Email confirmation on complaint submission
# Use a dedicated Gmail account (not your personal one)
# Steps to get an App Password:
#   1. Go to myaccount.google.com → Security
#   2. Enable 2-Step Verification
#   3. Search for "App passwords" and create one (e.g. "CrimeReport App")
#   4. Copy the 16-character password, remove spaces, and paste it below
GMAIL_USER=your-gmail-address@gmail.com
GMAIL_APP_PASSWORD=your16charapppassword
```

> ⚠️ **Never commit `.env.local` to version control.**
>
> **Note:** The old `ADMIN_PHONE`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` variables are no longer used. Admin credentials are now stored in the `admins` database table. See [Admin Management](#-admin-management) for details.

---

## 🚀 Run on localhost

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| URL                  | Description                   |
|----------------------|-------------------------------|
| `/`                  | Public homepage               |
| `/complaint`         | Register a new complaint      |
| `/track`             | Track complaint by ID         |
| `/map`               | Live map of all complaints    |
| `/admin/login`       | Admin login                   |
| `/admin`             | Admin dashboard               |
| `/admin/map`         | Admin map view                |

---

## 👤 Admin Management

Admin accounts are stored in the `admins` Supabase table. Passwords are **never** stored in plain text — only bcrypt hashes are stored. There are no environment variables for admin credentials.

### Roles

| Role         | Description                                  |
|--------------|----------------------------------------------|
| `admin`      | Standard admin — can view and update complaints |
| `superadmin` | Full access (currently the same as `admin` — extendable) |

### Registering a New Admin

**Step 1 — Generate a bcrypt hash for the password**

Run this command in your terminal (requires `bcryptjs` to be installed):

```bash
node -e "const b = require('bcryptjs'); b.hash('YourPassword123', 12).then(h => console.log(h));"
```

Replace `YourPassword123` with the actual password. Copy the output — it will look like:
```
$2b$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Step 2 — Insert the admin record in Supabase**

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
INSERT INTO admins (name, phone, password_hash, role)
VALUES (
  'Jane Smith',         -- display name
  '+1987654321',        -- phone number used to log in
  '$2b$12$...',         -- paste your bcrypt hash here
  'admin'               -- 'admin' or 'superadmin'
);
```

**Step 3 — Log in**

Navigate to `/admin/login` and enter the phone number and password you just registered.

### Updating an Admin Password

Generate a new bcrypt hash (Step 1 above), then run:

```sql
UPDATE admins
SET password_hash = '$2b$12$...'   -- new hash
WHERE phone = '+1987654321';
```

### Removing an Admin

```sql
DELETE FROM admins WHERE phone = '+1987654321';
```

### Viewing All Admins

```sql
SELECT id, name, phone, role, created_at FROM admins ORDER BY created_at;
```

> **Security note:** All of the SQL above requires the Supabase **service_role** key to execute, because Row Level Security (RLS) is enabled on the `admins` table and only the service role can access it. Running these queries directly in the **Supabase SQL Editor** (which uses the service role internally) is the recommended approach.

---

## 🏗️ Build for Production

```bash
npm run build
npm run start
```

---

## 🔒 Security Best Practices Implemented

1. **Service Role Key** is only used server-side (never in browser code).
2. **Admin session** is stored as an httpOnly, SameSite=Lax cookie containing a signed JWT.
3. **Admin passwords** are stored as bcrypt hashes (12 rounds) — never in plain text or environment variables.
4. **Row Level Security (RLS)** is enabled on all Supabase tables.
5. **Status update API** validates the session token via the `Authorization` header.
6. **Environment variables** for secrets are excluded from version control.
7. **Images** are uploaded through the server – no direct client-to-storage writes needed.
8. **Input validation** on all API routes before database operations.
9. **Gmail credentials** are only accessed server-side.

---

## 📧 Email Integration (Nodemailer + Gmail)

When a complaint is submitted:
1. The server generates a unique `CR-XXXXX` complaint ID.
2. The complaint is saved to Supabase.
3. A confirmation email is sent to the submitter's email address:

```
Subject: Complaint Registered – ID: CR-10294

Your complaint has been successfully registered.
Complaint ID: CR-10294
Use this ID to track the status on our platform.
```

If Gmail credentials are not configured, the email step is silently skipped and the complaint is still saved.

### Getting a Gmail App Password

1. Go to [myaccount.google.com](https://myaccount.google.com) → **Security**.
2. Enable **2-Step Verification** (required).
3. Search for **App passwords** and create a new one (e.g. "CrimeReport App").
4. Copy the 16-character password, remove spaces, and set it as `GMAIL_APP_PASSWORD`.

> 💡 **Tip:** Use a dedicated Gmail account (e.g. `crimereport.app@gmail.com`) rather than your personal email.

---

## 🗺️ Map Marker Colors

| Status      | Color  |
|-------------|--------|
| Pending     | 🟡 Yellow |
| In Progress | 🔵 Blue   |
| Resolved    | 🟢 Green  |
