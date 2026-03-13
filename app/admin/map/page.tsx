'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { Complaint } from '@/types';
import { getStatusColor, getMarkerColor } from '@/lib/utils';

// Load LiveMap dynamically to avoid SSR Leaflet errors
const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });

export default function AdminMapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function fetchComplaints() {
    try {
      const res = await fetch('/api/complaints');
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
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-slate-300 hover:text-white transition-colors text-sm">
            ← Dashboard
          </Link>
          <span className="text-slate-600">|</span>
          <h1 className="text-lg font-bold">🗺️ Crime Map View</h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-400">
            {complaints.length} complaint{complaints.length !== 1 ? 's' : ''} on map
          </span>
          <button
            onClick={() => { setLoading(true); fetchComplaints(); }}
            className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-900 border-b border-red-700 text-red-200 px-6 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Map fills remaining space */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-4xl animate-pulse mb-3">🗺️</div>
              <p className="text-slate-400">Loading map data…</p>
            </div>
          </div>
        ) : (
          <LiveMap complaints={complaints} height="calc(100vh - 120px)" />
        )}
      </div>

      {/* Legend */}
      <div className="bg-slate-800 border-t border-slate-700 px-6 py-3 flex flex-wrap gap-4 items-center text-sm">
        <span className="text-slate-400 font-medium">Legend:</span>
        {[
          { status: 'Pending', label: 'Pending' },
          { status: 'In Progress', label: 'In Progress' },
          { status: 'Resolved', label: 'Resolved' },
        ].map(({ status, label }) => (
          <div key={status} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full border border-slate-600"
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
