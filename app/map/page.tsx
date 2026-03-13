'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { ComplaintWithImages } from '@/types';
import { getStatusColor, getMarkerColor } from '@/lib/utils';

// Load LiveMap dynamically to avoid SSR Leaflet errors
const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });

const STATUS_OPTIONS = ['All', 'Pending', 'In Progress', 'Resolved'];
const ISSUE_TYPES = ['All', 'Robbery', 'Murder', 'Assault', 'Theft', 'Harassment', 'Missing Person', 'Other'];

export default function MapPage() {
  const [complaints, setComplaints] = useState<ComplaintWithImages[]>([]);
  const [filtered, setFiltered] = useState<ComplaintWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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
    if (dateFrom || dateTo) {
      result = result.filter((c) => {
        const date = c.created_at.slice(0, 10);
        return (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
      });
    }
    setFiltered(result);
  }, [complaints, statusFilter, typeFilter, dateFrom, dateTo]);

  async function fetchComplaints() {
    try {
      const res = await fetch('/api/complaints?include_images=true');
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

  const hasDateFilter = !!(dateFrom || dateTo);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-950 text-white px-6 py-0 flex-shrink-0">
        <div className="max-w-none flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Home
            </Link>
            <svg className="w-3.5 h-3.5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <h1 className="text-sm font-semibold text-slate-200">Live Crime Map</h1>
          </div>
          <button
            onClick={() => { setLoading(true); fetchComplaints(); }}
            className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0">
        {/* Stats & Filter Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex-shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Stats */}
            <div className="flex gap-2 flex-wrap">
              <StatBadge label="Total" value={stats.total} color="bg-slate-100 text-slate-700 border border-slate-200" />
              <StatBadge label="Pending" value={stats.pending} color="bg-amber-50 text-amber-700 border border-amber-200" />
              <StatBadge label="In Progress" value={stats.inProgress} color="bg-blue-50 text-blue-700 border border-blue-200" />
              <StatBadge label="Resolved" value={stats.resolved} color="bg-emerald-50 text-emerald-700 border border-emerald-200" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              >
                {ISSUE_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <div className="flex items-center gap-1.5">
                <label htmlFor="map-date-from" className="text-xs text-slate-500 font-medium">From</label>
                <input
                  id="map-date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <label htmlFor="map-date-to" className="text-xs text-slate-500 font-medium">To</label>
                <input
                  id="map-date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                />
              </div>
              {hasDateFilter && (
                <button
                  onClick={() => { setDateFrom(''); setDateTo(''); }}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 border border-slate-300 rounded-lg transition-colors hover:bg-slate-50"
                >
                  Clear Dates
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 px-6 py-3 text-sm flex items-center gap-2 flex-shrink-0">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">Loading map data…</p>
              </div>
            </div>
          ) : (
            <div className="p-3 h-full">
              <LiveMap complaints={filtered} height="calc(100vh - 180px)" />
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex flex-wrap gap-4 items-center text-xs flex-shrink-0">
          <span className="text-slate-500 font-semibold">Legend:</span>
          {[
            { status: 'Pending', label: 'Pending' },
            { status: 'In Progress', label: 'In Progress' },
            { status: 'Resolved', label: 'Resolved' },
          ].map(({ status, label }) => (
            <div key={status} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: getMarkerColor(status) }}
              />
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
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
    <div className={`${color} px-2.5 py-1 rounded-lg font-medium text-xs`}>
      {label}: <span className="font-bold">{value}</span>
    </div>
  );
}
