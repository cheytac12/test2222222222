'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { Complaint } from '@/types';
import { getStatusColor, getMarkerColor } from '@/lib/utils';

// Load LiveMap dynamically to avoid SSR Leaflet errors
const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });

const STATUS_OPTIONS = ['All', 'Pending', 'In Progress', 'Resolved'];
const ISSUE_TYPES = ['All', 'Robbery', 'Murder', 'Assault', 'Theft', 'Harassment', 'Missing Person', 'Other'];

export default function MapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filtered, setFiltered] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    fetchComplaints();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchComplaints, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = complaints;
    if (statusFilter !== 'All') result = result.filter((c) => c.status === statusFilter);
    if (typeFilter !== 'All') result = result.filter((c) => c.issue_type === typeFilter);
    setFiltered(result);
  }, [complaints, statusFilter, typeFilter]);

  async function fetchComplaints() {
    try {
      const res = await fetch('/api/complaints');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setComplaints(data.complaints ?? []);
    } catch {
      setError('Failed to load complaint data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'Pending').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress').length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">
            ← Home
          </Link>
          <span className="text-slate-700">|</span>
          <h1 className="text-sm font-semibold">Live Crime Map</h1>
        </div>
        <button
          onClick={() => { setLoading(true); fetchComplaints(); }}
          className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded transition-colors"
        >
          Refresh
        </button>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Stats Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3 text-xs">
            <StatBadge label="Total" value={stats.total} color="bg-slate-100 text-slate-700" />
            <StatBadge label="Pending" value={stats.pending} color="bg-yellow-100 text-yellow-700" />
            <StatBadge label="In Progress" value={stats.inProgress} color="bg-blue-100 text-blue-700" />
            <StatBadge label="Resolved" value={stats.resolved} color="bg-green-100 text-green-700" />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-slate-300 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ISSUE_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 px-6 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">Loading map data…</p>
              </div>
            </div>
          ) : (
            <div className="p-4 h-full">
              <LiveMap complaints={filtered} height="calc(100vh - 200px)" />
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex flex-wrap gap-4 items-center text-xs">
          <span className="text-slate-500 font-medium">Legend:</span>
          {[
            { status: 'Pending', label: 'Pending' },
            { status: 'In Progress', label: 'In Progress' },
            { status: 'Resolved', label: 'Resolved' },
          ].map(({ status, label }) => (
            <div key={status} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: getMarkerColor(status) }}
              />
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(status)}`}>
                {label}
              </span>
            </div>
          ))}
          <span className="ml-auto text-slate-400">
            Showing {filtered.length} of {complaints.length} · Auto-refreshes every 30s
          </span>
        </div>
      </main>
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`${color} px-2.5 py-1 rounded font-medium`}>
      {label}: {value}
    </div>
  );
}
