'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.phone || !form.password) {
      setError('Please enter your phone number and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Login failed. Please check your credentials.');
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 text-white px-6 py-5">
          <h1 className="text-base font-semibold">Admin Login</h1>
          <p className="text-slate-400 text-xs mt-1">CrimeReport Administration Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
              {error}
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
              value={form.phone}
              onChange={handleChange}
              placeholder="+1234567890"
              required
              autoComplete="username"
              className="w-full border border-slate-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full border border-slate-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            Sign In
          </button>
        </form>

        <div className="px-6 pb-5 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
