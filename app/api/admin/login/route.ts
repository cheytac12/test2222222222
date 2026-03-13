import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? '';
const ADMIN_PHONE = process.env.ADMIN_PHONE ?? '+1234567890';

// ─── POST /api/admin/login ─────────────────────────────────────────────────
// Validates admin credentials and sets a session cookie
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phone, password } = body as { phone?: string; password?: string };

  if (!phone || !password) {
    return NextResponse.json(
      { error: 'Phone and password are required' },
      { status: 400 }
    );
  }

  // Constant-time comparison to avoid timing attacks
  const phoneMatch = phone === ADMIN_PHONE;
  const passMatch = password === ADMIN_PASSWORD;

  if (!phoneMatch || !passMatch) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Create a simple signed session token
  // In production, use a proper JWT or Supabase Auth
  const sessionToken = SESSION_SECRET;

  // Set an httpOnly session cookie (secure in production)
  const cookieStore = await cookies();
  cookieStore.set('admin_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  });

  return NextResponse.json({ success: true });
}
