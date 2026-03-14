# Migration: Add `city` column to `complaints` table

Run the following SQL in your **Supabase SQL Editor** (Dashboard → SQL Editor → New query).

## Step 1 — Add the `city` column

```sql
-- Add optional city column to complaints table
ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS city TEXT;

-- Index for fast city lookups / filtering
CREATE INDEX IF NOT EXISTS idx_complaints_city
  ON complaints(city);
```

## Step 2 — Backfill existing data (optional)

If you want to populate `city` for existing complaints you can update them manually:

```sql
-- Example: manually set city for a specific complaint
UPDATE complaints
SET city = 'New York'
WHERE complaint_id = 'CR-12345';
```

## Notes

- The `city` column is **nullable** — existing complaints are unaffected.
- The frontend complaint form now exposes an optional **City** input field.
- The `GET /api/complaints` endpoint supports a `?city=<name>` query parameter for case-insensitive filtering.
- The complaints feed UI groups complaints by city automatically when no city filter is selected.
