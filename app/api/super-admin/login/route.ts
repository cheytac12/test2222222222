import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { compare } from 'bcryptjs';
import { SignJWT } from 'jose';
import { supabaseAdmin } from '@/lib/supabase-server';

// ─── POST /api/super-admin/login ────────────────────────────────────────────
// Validates super admin credentials and sets a dedicated super_admin_session cookie.
// Only accounts with role='superadmin' are permitted to log in via this endpoint.
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phone, password } = body as { phone?: string; password?: string };

  if (!phone || !password) {
    return NextResponse.json(
      { error: 'Phone and password are required' },
      { status: 400 }
    );
  }

  // Fetch admin record by phone number
  const { data: admin, error: dbError } = await supabaseAdmin
    .from('admins')
    .select('id, name, phone, password_hash, role')
    .eq('phone', phone)
    .single();

  if (dbError || !admin) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Only allow super admins to log in through this endpoint
  if (admin.role !== 'superadmin') {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Securely verify password against stored bcrypt hash
  const passwordValid = await compare(password, admin.password_hash);
  if (!passwordValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Generate a signed JWT
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    console.error('Super admin login failed: JWT_SECRET is missing or too short.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const secret = new TextEncoder().encode(jwtSecret);
  const token = await new SignJWT({
    sub: admin.id,
    phone: admin.phone,
    name: admin.name,
    role: admin.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret);

  // Set a dedicated httpOnly session cookie for super admins
  const cookieStore = await cookies();
  cookieStore.set('super_admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  });

  return NextResponse.json({ success: true });
}
