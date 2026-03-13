-- ============================================================
-- Crime Complaint Reporting Platform - Database Schema
-- Run this SQL in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: complaints
-- Stores all submitted crime complaints
-- ============================================================
CREATE TABLE IF NOT EXISTS complaints (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id     TEXT UNIQUE NOT NULL,         -- e.g. "CR-10294"
  name             TEXT NOT NULL,
  phone            TEXT NOT NULL,
  issue_type       TEXT NOT NULL,
  description      TEXT NOT NULL,
  latitude         DOUBLE PRECISION,
  longitude        DOUBLE PRECISION,
  status           TEXT NOT NULL DEFAULT 'Pending'
                   CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: complaint_images
-- Stores references to images uploaded for a complaint
-- ============================================================
CREATE TABLE IF NOT EXISTS complaint_images (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id     TEXT NOT NULL REFERENCES complaints(complaint_id) ON DELETE CASCADE,
  storage_path     TEXT NOT NULL,               -- path in Supabase Storage bucket
  public_url       TEXT NOT NULL,               -- public accessible URL
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: status_updates
-- Audit trail for complaint status changes by admins
-- ============================================================
CREATE TABLE IF NOT EXISTS status_updates (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id     TEXT NOT NULL REFERENCES complaints(complaint_id) ON DELETE CASCADE,
  old_status       TEXT,
  new_status       TEXT NOT NULL,
  updated_by       TEXT,                        -- admin email or ID
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE complaints       ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_updates   ENABLE ROW LEVEL SECURITY;

-- complaints: public can insert (submit complaints)
CREATE POLICY "Public can insert complaints"
  ON complaints FOR INSERT
  TO anon
  WITH CHECK (true);

-- complaints: public can read by complaint_id (for tracking)
CREATE POLICY "Public can read complaints"
  ON complaints FOR SELECT
  TO anon
  USING (true);

-- complaint_images: public can insert
CREATE POLICY "Public can insert complaint images"
  ON complaint_images FOR INSERT
  TO anon
  WITH CHECK (true);

-- complaint_images: public can read
CREATE POLICY "Public can read complaint images"
  ON complaint_images FOR SELECT
  TO anon
  USING (true);

-- status_updates: service role manages via API (no direct anon access)
CREATE POLICY "Service role can manage status updates"
  ON status_updates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- complaints: service role can update status
CREATE POLICY "Service role can update complaints"
  ON complaints FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- STORAGE: Create "complaint-images" bucket
-- Run this in Supabase Dashboard > Storage OR via SQL below
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('complaint-images', 'complaint-images', true)
-- ON CONFLICT DO NOTHING;

-- Storage policy: public can upload
-- CREATE POLICY "Public upload complaint images"
--   ON storage.objects FOR INSERT
--   TO anon
--   WITH CHECK (bucket_id = 'complaint-images');

-- Storage policy: public read
-- CREATE POLICY "Public read complaint images"
--   ON storage.objects FOR SELECT
--   TO anon
--   USING (bucket_id = 'complaint-images');

-- ============================================================
-- INDEX: Speed up lookups by complaint_id
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_complaints_complaint_id
  ON complaints(complaint_id);

CREATE INDEX IF NOT EXISTS idx_complaint_images_complaint_id
  ON complaint_images(complaint_id);

CREATE INDEX IF NOT EXISTS idx_status_updates_complaint_id
  ON status_updates(complaint_id);
