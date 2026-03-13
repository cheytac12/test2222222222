import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAndConsumeOtp } from '@/lib/otp-store';

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? '';
const ADMIN_PHONE = process.env.ADMIN_PHONE ?? '+1234567890';

// ─── POST /api/admin/login ─────────────────────────────────────────────────
// Verifies the OTP sent via /api/admin/send-otp and sets a session cookie.
// Twilio is used directly (not through Supabase) to send the OTP.
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phone, otp } = body as { phone?: string; otp?: string };

  if (!phone || !otp) {
    return NextResponse.json(
      { error: 'Phone number and OTP are required' },
      { status: 400 }
    );
  }

  // Validate that the phone matches the configured admin number.
  if (phone !== ADMIN_PHONE) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Verify the OTP from the in-memory store (generated and sent via direct Twilio).
  if (!verifyAndConsumeOtp(phone, otp)) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
  }

  // Set an httpOnly session cookie (secure in production)
  const cookieStore = await cookies();
  cookieStore.set('admin_session', SESSION_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  });

  return NextResponse.json({ success: true });
}
