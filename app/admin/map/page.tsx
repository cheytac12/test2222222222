'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { ComplaintWithImages } from '@/types';
import { getStatusColor, getMarkerColor } from '@/lib/utils';

// Load LiveMap dynamically to avoid SSR Leaflet errors
const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });

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
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-0 flex-shrink-0">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Dashboard
            </Link>
            <svg className="w-3.5 h-3.5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <h1 className="text-sm font-semibold text-slate-200">Crime Map View</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:block">
              {complaints.length} complaint{complaints.length !== 1 ? 's' : ''} on map
            </span>
            <button
              onClick={() => { setLoading(true); fetchComplaints(); }}
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-900/40 border-b border-red-800/40 text-red-300 px-6 py-3 text-sm flex items-center gap-2 flex-shrink-0">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* Map fills remaining space */}
      <div className="flex-1 p-3">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading map data…</p>
            </div>
          </div>
        ) : (
          <LiveMap complaints={complaints} height="calc(100vh - 120px)" />
        )}
      </div>

      {/* Legend */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex flex-wrap gap-4 items-center text-xs flex-shrink-0">
        <span className="text-slate-400 font-semibold">Legend:</span>
        {[
          { status: 'Pending', label: 'Pending' },
          { status: 'In Progress', label: 'In Progress' },
          { status: 'Resolved', label: 'Resolved' },
        ].map(({ status, label }) => (
          <div key={status} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: getMarkerColor(status) }}
            />
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
