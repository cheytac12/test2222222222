# Instructions – Human Actions Required

This document describes the manual steps you must complete after the automated code changes have been deployed.

---

## 1. Install NPM Packages

Run this in your project root:

```bash
npm install
```

New packages added:
- `bcryptjs` – for securely hashing and verifying admin passwords
- `jose` – for generating and verifying JWTs
- `recharts` – for analytics charts

---

## 2. Update Your `.env.local`

Add the following variable to your `.env.local` file (create it at the project root if it does not exist):

```env
# Required: A secret key for signing JWTs. Must be at least 32 characters.
# Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=replace_this_with_a_long_random_secret_at_least_32_chars
```

> **Note:** The old `ADMIN_PHONE`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` environment variables are no longer used by the updated login logic. You can remove them or leave them unused.

---

## 3. Run the Database Migration in Supabase

Open your **Supabase Dashboard → SQL Editor → New Query** and run the SQL below.

### Step 1 — Create the `admins` table

```sql
-- Enable UUID extension (safe if already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  phone         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin'
                CHECK (role IN ('admin', 'superadmin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Only the service role (backend API) can access admin records
CREATE POLICY "Service role manages admins"
  ON admins FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for fast phone-based lookups
CREATE INDEX IF NOT EXISTS idx_admins_phone ON admins(phone);
```

### Step 2 — Insert your first admin

First, generate a bcrypt hash for your chosen password. Run this in your terminal:

```bash
node -e "const b = require('bcryptjs'); b.hash('YourPassword123', 12).then(h => console.log(h));"
```

Replace `YourPassword123` with your actual desired password. Copy the output hash (starts with `$2b$12$...`).

Then run this SQL (replace the values):

```sql
INSERT INTO admins (name, phone, password_hash, role)
VALUES (
  'Super Admin',              -- display name
  '+1234567890',              -- phone number used to log in
  '$2b$12$...',               -- paste your bcrypt hash here
  'superadmin'
);
```

---

## 4. Verify Storage Bucket

Make sure your Supabase Storage bucket named `complaint-images` exists and has public read access. If it does not exist yet:

1. Go to **Supabase Dashboard → Storage**
2. Create a new bucket named `complaint-images`
3. Enable **Public bucket** access

---

## 5. Summary of Code Changes

| Feature | Files Changed |
|---|---|
| Multiple admin support (JWT auth) | `app/api/admin/login/route.ts` |
| JWT verification for status updates | `app/api/complaints/[id]/route.ts` |
| Rate limiting + honeypot spam protection | `app/api/complaints/route.ts` |
| Honeypot field on complaint form | `app/complaint/page.tsx` |
| Map popups with complaint images | `components/LiveMap.tsx`, `app/admin/map/page.tsx` |
| Analytics dashboard with recharts | `app/admin/analytics/page.tsx` |
| Analytics link in admin nav | `app/admin/page.tsx` |
| Removed "Accepted Complaint Types" section | `app/page.tsx` |
| Database migration SQL | `database/migrations/001_admins_table.md` |

---

## 6. Rate Limiting Notes

The complaint submission endpoint (`POST /api/complaints`) now enforces a limit of **5 submissions per IP per minute**. This uses an in-memory store that resets when the server restarts.

> **Note for production:** If you deploy to a serverless environment (e.g. Vercel), each function invocation is stateless and the in-memory rate limiter resets per cold start. For persistent rate limiting in production, consider replacing it with a Redis-backed solution such as [Upstash Rate Limit](https://github.com/upstash/ratelimit).
