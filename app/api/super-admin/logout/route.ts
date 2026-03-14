import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ─── POST /api/super-admin/logout ───────────────────────────────────────────
// Clears the super admin session cookie
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('super_admin_session');
  return NextResponse.json({ success: true });
}
