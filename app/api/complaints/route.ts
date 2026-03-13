import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { generateComplaintId } from '@/lib/utils';

// ─── In-memory IP rate limiter ─────────────────────────────────────────────
// Allows up to MAX_REQUESTS per IP within WINDOW_MS milliseconds.
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS) {
    return true;
  }

  entry.count += 1;
  return false;
}

// ─── GET /api/complaints ───────────────────────────────────────────────────
// Returns all complaints (used by map dashboard and admin panel)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const issueType = searchParams.get('issue_type');
  const search = searchParams.get('search'); // search by complaint_id
  const dateFrom = searchParams.get('date_from'); // ISO date string
  const dateTo = searchParams.get('date_to'); // ISO date string
  const includeImages = searchParams.get('include_images') !== 'false';

  const selectClause = includeImages ? '*, complaint_images(*)' : '*';

  let query = supabaseAdmin
    .from('complaints')
    .select(selectClause)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (issueType) query = query.eq('issue_type', issueType);
  if (search) query = query.ilike('complaint_id', `%${search}%`);
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', dateTo);

  const { data, error } = await query;

  if (error) {
    console.error('GET /api/complaints error:', error);
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
  }

  return NextResponse.json({ complaints: data });
}

// ─── POST /api/complaints ──────────────────────────────────────────────────
// Creates a new complaint. Expects multipart/form-data with optional images.
export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting ──────────────────────────────────────────────────────
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please wait a minute before trying again.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();

    // ── Honeypot check ─────────────────────────────────────────────────────
    // If the hidden honeypot field is filled, this is likely a bot
    const honeypot = formData.get('website') as string | null;
    if (honeypot && honeypot.trim() !== '') {
      // Return a fake success to not reveal detection to bots
      return NextResponse.json({ success: true, complaint_id: 'CR-00000' }, { status: 201 });
    }

    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const issue_type = formData.get('issue_type') as string;
    const description = formData.get('description') as string;
    const latStr = formData.get('latitude') as string | null;
    const lonStr = formData.get('longitude') as string | null;
    const images = formData.getAll('images') as File[];

    // Validate required fields
    if (!name || !phone || !issue_type || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, phone, issue_type, description' },
        { status: 400 }
      );
    }

    // Generate a unique complaint ID (retry on collision, max 5 attempts)
    let complaint_id = '';
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidateId = generateComplaintId();
      const { data: existing } = await supabaseAdmin
        .from('complaints')
        .select('complaint_id')
        .eq('complaint_id', candidateId)
        .single();
      if (!existing) {
        complaint_id = candidateId;
        break;
      }
    }
    if (!complaint_id) {
      return NextResponse.json({ error: 'Could not generate unique complaint ID' }, { status: 500 });
    }

    // Insert the complaint record
    const { data: complaint, error: insertError } = await supabaseAdmin
      .from('complaints')
      .insert({
        complaint_id,
        name,
        phone,
        issue_type,
        description,
        latitude: latStr ? parseFloat(latStr) : null,
        longitude: lonStr ? parseFloat(lonStr) : null,
        status: 'Pending',
      })
      .select()
      .single();

    if (insertError || !complaint) {
      console.error('Complaint insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save complaint' }, { status: 500 });
    }

    // Upload images to Supabase Storage
    const uploadedImages: Array<{ storage_path: string; public_url: string }> = [];

    for (const file of images) {
      if (!file || !file.size) continue;

      const ext = file.name.split('.').pop() ?? 'jpg';
      const storagePath = `${complaint_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin.storage
        .from('complaint-images')
        .upload(storagePath, buffer, { contentType: file.type || 'image/jpeg' });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        continue; // Skip failed images, don't fail the whole request
      }

      const { data: urlData } = supabaseAdmin.storage
        .from('complaint-images')
        .getPublicUrl(storagePath);

      uploadedImages.push({
        storage_path: storagePath,
        public_url: urlData.publicUrl,
      });
    }

    // Save image references to DB
    if (uploadedImages.length > 0) {
      const imageRows = uploadedImages.map((img) => ({
        complaint_id,
        storage_path: img.storage_path,
        public_url: img.public_url,
      }));
      const { error: imgInsertError } = await supabaseAdmin
        .from('complaint_images')
        .insert(imageRows);
      if (imgInsertError) {
        console.error('complaint_images insert error:', imgInsertError);
      }
    }

    // Send SMS confirmation via Twilio (best-effort, don't fail if SMS fails)
    await sendSmsConfirmation(phone, complaint_id);

    return NextResponse.json({ success: true, complaint_id }, { status: 201 });
  } catch (err) {
    console.error('POST /api/complaints unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── SMS Helper ────────────────────────────────────────────────────────────
async function sendSmsConfirmation(to: string, complaintId: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.warn('Twilio credentials not configured; skipping SMS.');
    return;
  }

  try {
    // Dynamic import to avoid requiring Twilio at module load time
    const twilio = (await import('twilio')).default;
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body: `Your complaint has been successfully registered. Complaint ID: ${complaintId}. Use this ID to track the status on our platform.`,
      from,
      to,
    });
    console.log(`SMS sent to ${to} for complaint ${complaintId}`);
  } catch (smsErr) {
    console.error('SMS send error (non-fatal):', smsErr);
  }
}
