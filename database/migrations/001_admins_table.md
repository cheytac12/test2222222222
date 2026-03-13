# Migration: Admins Table

Run the following SQL in your **Supabase SQL Editor** (Dashboard → SQL Editor → New query).

## Step 1 — Create the `admins` table

```sql
-- ============================================================
-- TABLE: admins
-- Supports multiple admins with hashed passwords and roles
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  phone         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin'
                CHECK (role IN ('admin', 'superadmin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Only service_role (backend) can read/write admins
CREATE POLICY "Service role manages admins"
  ON admins FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for fast phone lookups
CREATE INDEX IF NOT EXISTS idx_admins_phone ON admins(phone);
```

## Step 2 — Insert the default admin

Replace `<YOUR_BCRYPT_HASH>` with the bcrypt hash of your chosen password.

**How to generate the hash:**

You can generate it with Node.js in your terminal:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword123', 12).then(h => console.log(h));"
```

```sql
-- Insert a default admin (replace values as needed)
INSERT INTO admins (name, phone, password_hash, role)
VALUES (
  'Super Admin',
  '+1234567890',
  '<YOUR_BCRYPT_HASH>',
  'superadmin'
);
```

> **Example** – if your password is `Admin@1234`, the hash (12 rounds) will look like:
> `$2b$12$...` (a 60-character string starting with `$2b$12$`)

## Step 3 — Update `.env.local`

Add (or update) the following variable in your `.env.local` file:

```env
# Must be at least 32 random characters — used to sign JWTs
JWT_SECRET=replace_this_with_a_long_random_secret_string_at_least_32_chars
```

Remove (or leave unused) the old single-admin variables:

```env
# These are no longer used by the updated login route
# ADMIN_PHONE=...
# ADMIN_PASSWORD=...
# ADMIN_SESSION_SECRET=...
```
