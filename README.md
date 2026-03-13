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
      ├── POST /api/complaints          → Submit new complaint + SMS
      ├── GET  /api/complaints          → List all (with filters)
      ├── GET  /api/complaints/[id]     → Get complaint + images by ID
      ├── PATCH /api/complaints/[id]    → Update status (admin)
      ├── POST /api/admin/login         → Admin login → session cookie
      └── POST /api/admin/logout        → Clear session cookie

Supabase (PostgreSQL)
  ├── complaints table
  ├── complaint_images table
  └── status_updates table

Supabase Storage
  └── complaint-images bucket

Twilio (SMS)
  └── Confirmation SMS on complaint submission
```

---

## 🛠️ Technology Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 16, React 19, TailwindCSS v4 |
| Backend    | Next.js API Routes (App Router)      |
| Database   | Supabase (PostgreSQL)                |
| Auth       | Supabase Auth + httpOnly session cookie |
| Storage    | Supabase Storage                     |
| Map        | Leaflet.js + react-leaflet           |
| SMS        | Twilio API                           |
| Language   | TypeScript                           |

---

## 🗃️ Database Schema

See [`database/schema.sql`](./database/schema.sql) for the full Supabase SQL schema.

**Tables:**
- `complaints` – core complaint records
- `complaint_images` – file references for uploaded images
- `status_updates` – audit log of status changes

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
│   └── schema.sql                 # Supabase SQL schema
└── .env.local.example             # Environment variable template
```

---

## ⚙️ Supabase Setup Instructions

1. Go to [supabase.com](https://supabase.com) and create a new project.

2. In **SQL Editor**, run the contents of [`database/schema.sql`](./database/schema.sql).

3. In **Storage > Buckets**, create a bucket named **`complaint-images`** and set it to **Public**.

4. Add Storage policies (or run the commented-out SQL at the bottom of `schema.sql`):
   - Allow anonymous uploads to `complaint-images`
   - Allow public reads from `complaint-images`

5. Copy your credentials from **Project Settings > API**:
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

# Twilio SMS (optional – if not set, SMS step is skipped)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Admin credentials
ADMIN_PHONE=+1234567890
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_SESSION_SECRET=a-random-secret-of-at-least-32-characters
```

> ⚠️ **Never commit `.env.local` to version control.**

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

## 🏗️ Build for Production

```bash
npm run build
npm run start
```

---

## 🔒 Security Best Practices Implemented

1. **Service Role Key** is only used server-side (never in browser code).
2. **Admin session** is stored as an httpOnly, SameSite=Lax cookie.
3. **Row Level Security (RLS)** is enabled on all Supabase tables.
4. **Status update API** validates the session token via the `Authorization` header.
5. **Environment variables** for secrets are excluded from version control.
6. **Images** are uploaded through the server – no direct client-to-storage writes needed.
7. **Input validation** on all API routes before database operations.
8. **Twilio credentials** are only accessed server-side.

---

## 📱 SMS Integration (Twilio)

When a complaint is submitted:
1. The server generates a unique `CR-XXXXX` complaint ID.
2. The complaint is saved to Supabase.
3. A Twilio SMS is sent to the submitter's phone number:

```
Your complaint has been successfully registered.
Complaint ID: CR-10294.
Use this ID to track the status on our platform.
```

If Twilio credentials are not configured, the SMS step is silently skipped and the complaint is still saved.

---

## 🗺️ Map Marker Colors

| Status      | Color  |
|-------------|--------|
| Pending     | 🟡 Yellow |
| In Progress | 🔵 Blue   |
| Resolved    | 🟢 Green  |
