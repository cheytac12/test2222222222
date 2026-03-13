import { NextRequest, NextResponse } from 'next/server';
import { isTwilioConfigured, sendSms } from '@/lib/twilio';
import { generateOtp, storeOtp } from '@/lib/otp-store';

const ADMIN_PHONE = process.env.ADMIN_PHONE ?? '';

// ─── POST /api/admin/send-otp ──────────────────────────────────────────────
// Sends a one-time passcode to the admin phone via Twilio (direct API, not Supabase).
// Always returns 200 so callers cannot enumerate valid phone numbers.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { phone } = body as { phone?: string };

  if (!phone) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
  }

  // Only send an OTP if the phone matches the configured admin number.
  // We do NOT reveal whether the number is valid to avoid enumeration.
  if (phone === ADMIN_PHONE) {
    if (!isTwilioConfigured()) {
      return NextResponse.json(
        { error: 'SMS service is not configured. Please set Twilio credentials.' },
        { status: 503 }
      );
    }

    const otp = generateOtp();
    storeOtp(phone, otp);

    try {
      await sendSms(phone, `Your CrimeReport admin login code is: ${otp}. It expires in 10 minutes.`);
    } catch (err) {
      console.error('Failed to send admin OTP via Twilio:', err);
      return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
    }
  }

  // Return success regardless of whether the phone matched, to prevent enumeration.
  return NextResponse.json({ success: true });
}
