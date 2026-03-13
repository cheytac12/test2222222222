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
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="w-10 h-10 bg-gray-900 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286z" />
            </svg>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1">CrimeReport</p>
          <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 border-t-4 border-t-gray-900 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-sm px-4 py-3 text-sm flex gap-2.5 items-start">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
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
                className="w-full border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
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
                className="w-full border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-sm font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              )}
              Sign In
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs font-mono uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
