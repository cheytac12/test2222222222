'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { ComplaintWithImages } from '@/types';
import { getMarkerColor } from '@/lib/utils';

const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });

const STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Resolved: 'bg-green-50 text-green-700 border-green-200',
};

export default function AdminMapPage() {
  const [complaints, setComplaints] = useState<ComplaintWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function fetchComplaints() {
    try {
      const res = await fetch('/api/complaints?include_images=true');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setComplaints(data.complaints ?? []);
    } catch {
      setError('Failed to load complaint data.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 text-gray-900 px-6 py-0 flex-shrink-0">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 hover:text-gray-900 transition-colors text-xs flex items-center gap-1.5 uppercase tracking-wide">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Crime Map View</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-gray-400 hidden sm:block">
              {complaints.length} complaint{complaints.length !== 1 ? 's' : ''} on map
            </span>
            <button
              onClick={() => { setLoading(true); fetchComplaints(); }}
              className="text-xs border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white text-gray-600 px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 uppercase tracking-wide"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-b border-red-200 text-red-700 px-6 py-3 text-sm flex items-center gap-2 flex-shrink-0">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      <div className="flex-1 p-3">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono uppercase tracking-widest text-gray-400">Loading map data…</p>
            </div>
          </div>
        ) : (
          <LiveMap complaints={complaints} height="calc(100vh - 120px)" />
        )}
      </div>

      {/* Legend */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 flex flex-wrap gap-4 items-center flex-shrink-0">
        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Legend</span>
        {['Pending', 'In Progress', 'Resolved'].map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getMarkerColor(status) }} />
            <span className={`px-2 py-0.5 rounded-sm text-xs font-medium border ${STATUS_BADGE[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
