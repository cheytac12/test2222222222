import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ─── POST /api/admin/logout ────────────────────────────────────────────────
// Clears the admin session cookie
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  return NextResponse.json({ success: true });
}
