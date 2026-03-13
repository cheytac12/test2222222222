import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { compare } from 'bcryptjs';
import { SignJWT } from 'jose';
import { supabaseAdmin } from '@/lib/supabase-server';

// ─── POST /api/admin/login ─────────────────────────────────────────────────
// Validates admin credentials against the database and sets a signed JWT cookie
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
    // Use a generic message to avoid leaking which field was wrong
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
    console.error('JWT_SECRET is not set or is too short (min 32 chars)');
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

  // Set an httpOnly session cookie (secure in production)
  const cookieStore = await cookies();
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  });

  return NextResponse.json({ success: true });
}
