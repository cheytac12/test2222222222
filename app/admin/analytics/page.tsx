'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AnalyticsContent from '@/components/AnalyticsContent';

export default function AdminAnalyticsPage() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Nav */}
      <nav className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">
            ← Dashboard
          </Link>
          <span className="text-slate-700">|</span>
          <span className="font-semibold">Analytics</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <Link href="/admin/map" className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded transition-colors">
            View Map
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-700 hover:bg-red-600 px-3 py-1.5 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <AnalyticsContent />
    </div>
  );
}
