import { randomInt } from 'crypto';

/**
 * In-memory OTP store for admin authentication.
 * OTPs expire after 10 minutes and are consumed on successful verification.
 *
 * Note: This store is process-local. For multi-instance deployments,
 * replace with a shared store (e.g., Redis or a database table).
 * Expired entries are cleaned up lazily on access; run periodic cleanup
 * if high-volume usage is expected.
 */

interface OtpEntry {
  code: string;
  expiresAt: number;
}

const store = new Map<string, OtpEntry>();

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** Generates a cryptographically secure 6-digit numeric OTP code. */
export function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
}

/** Stores an OTP for the given phone number, overwriting any existing entry. */
export function storeOtp(phone: string, code: string): void {
  store.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MS });
}

/**
 * Verifies the OTP for the given phone number.
 * Deletes the entry on success or expiry. Returns true if valid.
 */
export function verifyAndConsumeOtp(phone: string, code: string): boolean {
  const entry = store.get(phone);
  if (!entry) return false;

  if (Date.now() > entry.expiresAt) {
    store.delete(phone);
    return false;
  }

  if (entry.code !== code) return false;

  store.delete(phone);
  return true;
}
