import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// ─── GET /api/complaints/[id] ──────────────────────────────────────────────
// Fetches a single complaint with its images by complaint_id (e.g. "CR-10294")
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: complaint, error } = await supabaseAdmin
    .from('complaints')
    .select('*')
    .eq('complaint_id', id.toUpperCase())
    .single();

  if (error || !complaint) {
    return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
  }

  const { data: images } = await supabaseAdmin
    .from('complaint_images')
    .select('*')
    .eq('complaint_id', id.toUpperCase());

  return NextResponse.json({ complaint, images: images ?? [] });
}

// ─── PATCH /api/complaints/[id] ────────────────────────────────────────────
// Updates the status of a complaint (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Validate admin session token from Authorization header
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token || token !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { status, notes } = body as { status?: string; notes?: string };

  const validStatuses = ['Pending', 'In Progress', 'Resolved'];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json(
      { error: 'Invalid status. Must be one of: Pending, In Progress, Resolved' },
      { status: 400 }
    );
  }

  // Get current status for the audit log
  const { data: existing } = await supabaseAdmin
    .from('complaints')
    .select('status')
    .eq('complaint_id', id.toUpperCase())
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
  }

  // Update complaint status
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('complaints')
    .update({ status })
    .eq('complaint_id', id.toUpperCase())
    .select()
    .single();

  if (updateError) {
    console.error('PATCH complaint error:', updateError);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }

  // Record audit log entry
  await supabaseAdmin.from('status_updates').insert({
    complaint_id: id.toUpperCase(),
    old_status: existing.status,
    new_status: status,
    updated_by: 'admin',
    notes: notes ?? null,
  });

  return NextResponse.json({ success: true, complaint: updated });
}
