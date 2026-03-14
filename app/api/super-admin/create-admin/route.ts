import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { hash } from 'bcryptjs';
import { jwtVerify } from 'jose';
import { supabaseAdmin } from '@/lib/supabase-server';

interface SuperAdminJwtPayload {
  sub: string;
  phone: string;
  name: string;
  role: string;
}

/** Verify the request is from an authenticated super admin. Returns payload or null. */
async function verifySuperAdmin(jwtSecret: string): Promise<SuperAdminJwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('super_admin_session')?.value ?? null;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret));
    const typed = payload as unknown as SuperAdminJwtPayload;
    if (typed.role !== 'superadmin') return null;
    return typed;
  } catch {
    return null;
  }
}

// ─── POST /api/super-admin/create-admin ────────────────────────────────────
// Creates a new admin account. Only authenticated super admins may call this.
// Expects JSON body: { name, phone, password }
export async function POST(request: NextRequest) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const caller = await verifySuperAdmin(jwtSecret);
  if (!caller) {
    return NextResponse.json({ error: 'Forbidden – superadmin access required' }, { status: 403 });
  }

  const body = await request.json() as { name?: string; phone?: string; password?: string };
  const { name, phone, password } = body;

  if (!name || !phone || !password) {
    return NextResponse.json(
      { error: 'name, phone, and password are required' },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    );
  }

  // Check if phone is already in use
  const { data: existing } = await supabaseAdmin
    .from('admins')
    .select('id')
    .eq('phone', phone)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'An admin with that phone number already exists' },
      { status: 409 }
    );
  }

  // Hash the password before storing
  const password_hash = await hash(password, 12);

  const { data: newAdmin, error: insertError } = await supabaseAdmin
    .from('admins')
    .insert({ name, phone, password_hash, role: 'admin' })
    .select('id, name, phone, role, created_at')
    .single();

  if (insertError || !newAdmin) {
    console.error('create-admin insert error:', insertError);
    return NextResponse.json({ error: 'Failed to create admin account' }, { status: 500 });
  }

  return NextResponse.json({ success: true, admin: newAdmin }, { status: 201 });
}
