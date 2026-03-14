import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { supabaseAdmin } from '@/lib/supabase-server';

interface AdminJwtPayload {
  sub: string;
  phone: string;
  name: string;
  role: string;
}

/** Verify request is from a super admin.  Returns the payload or null. */
async function verifySuperAdmin(jwtSecret: string): Promise<AdminJwtPayload | null> {
  const cookieStore = await cookies();
  // Super admins authenticate via their own dedicated session cookie
  const token = cookieStore.get('super_admin_session')?.value ?? null;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret));
    const typed = payload as unknown as AdminJwtPayload;
    if (typed.role !== 'superadmin') return null;
    return typed;
  } catch {
    return null;
  }
}

// ─── GET /api/admin/super/users ─────────────────────────────────────────────
// Returns all admins in the system (superadmin only)
export async function GET(_request: NextRequest) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const caller = await verifySuperAdmin(jwtSecret);
  if (!caller) {
    return NextResponse.json({ error: 'Forbidden – superadmin access required' }, { status: 403 });
  }

  const { data: admins, error } = await supabaseAdmin
    .from('admins')
    .select('id, name, phone, role, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Super admin GET /users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }

  return NextResponse.json({ admins: admins ?? [] });
}

// ─── DELETE /api/admin/super/users ──────────────────────────────────────────
// Removes an admin by id (superadmin only). Expects JSON body: { id: string }
export async function DELETE(request: NextRequest) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const caller = await verifySuperAdmin(jwtSecret);
  if (!caller) {
    return NextResponse.json({ error: 'Forbidden – superadmin access required' }, { status: 403 });
  }

  const body = await request.json() as { id?: string };
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  // Prevent a superadmin from deleting themselves
  if (caller.sub === id) {
    return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('admins')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Super admin DELETE /users error:', error);
    return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// ─── PATCH /api/admin/super/users ───────────────────────────────────────────
// Updates an admin's role (superadmin only). Expects JSON body: { id, role }
export async function PATCH(request: NextRequest) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const caller = await verifySuperAdmin(jwtSecret);
  if (!caller) {
    return NextResponse.json({ error: 'Forbidden – superadmin access required' }, { status: 403 });
  }

  const body = await request.json() as { id?: string; role?: string };
  const { id, role } = body;

  if (!id || !role) {
    return NextResponse.json({ error: 'id and role are required' }, { status: 400 });
  }

  const VALID_ROLES = ['admin', 'superadmin'];
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role value' }, { status: 400 });
  }

  // Prevent superadmin from demoting themselves
  if (caller.sub === id && role !== 'superadmin') {
    return NextResponse.json({ error: 'You cannot revoke your own superadmin role' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('admins')
    .update({ role })
    .eq('id', id);

  if (error) {
    console.error('Super admin PATCH /users error:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
