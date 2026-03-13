'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();

  // step 1: request OTP  |  step 2: enter OTP
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Step 1: send OTP ────────────────────────────────────────────────────
  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!phone) {
      setError('Please enter your phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to send OTP. Please try again.');
        return;
      }

      setStep(2);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: verify OTP ──────────────────────────────────────────────────
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Invalid or expired OTP.');
        return;
      }

      router.push('/admin');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 text-white px-6 py-5 text-center">
          <div className="text-3xl mb-2">🔐</div>
          <h1 className="text-xl font-bold">Admin Login</h1>
          <p className="text-slate-400 text-sm mt-1">CrimeReport Administration Panel</p>
        </div>

        {step === 1 ? (
          /* ── Step 1: Enter phone number ── */
          <form onSubmit={handleRequestOtp} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                required
                autoComplete="username"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">A one-time code will be sent to this number.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {loading ? '⏳ Sending OTP…' : 'Send OTP'}
            </button>
          </form>
        ) : (
          /* ── Step 2: Enter OTP ── */
          <form onSubmit={handleVerifyOtp} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm">
                ⚠️ {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-3 text-sm">
              📱 A 6-digit OTP has been sent to <strong>{phone}</strong>. It expires in 10 minutes.
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-slate-700 mb-1">
                One-Time Passcode
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                autoComplete="one-time-code"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-center text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {loading ? '⏳ Verifying…' : 'Verify & Sign In'}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setOtp(''); setError(''); }}
              className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              ← Use a different phone number
            </button>
          </form>
        )}

        <div className="px-6 pb-5 text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

