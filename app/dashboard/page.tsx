'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { ComplaintWithImages } from '@/types';
import { CRIME_TYPE_COLORS } from '@/components/MapHeatmap';
import ComplaintsFeed from '@/components/ComplaintsFeed';
import AnalyticsContent from '@/components/AnalyticsContent';

const MapHeatmap = dynamic(() => import('@/components/MapHeatmap'), { ssr: false });

const STATUS_OPTIONS = ['All', 'Pending', 'In Progress', 'Resolved'];
const ISSUE_TYPES = ['All', 'Robbery', 'Murder', 'Assault', 'Theft', 'Harassment', 'Missing Person', 'Other'];

/**
 * CombinedDashboard – unified public view that merges the Live Map (now with
 * crime-type heatmap), Global Complaints Feed, and Analytics into a single
 * scrollable page.
 */
export default function CombinedDashboard() {
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
    const interval = setInterval(fetchComplaints, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-6 py-0 sticky top-0 z-40">
        <div className="max-w-none flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-900 transition-colors text-xs flex items-center gap-1.5 uppercase tracking-wide">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Crime Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <a href="#map-section" className="text-xs text-gray-500 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-sm transition-colors uppercase tracking-wide">Map</a>
            <a href="#feed-section" className="text-xs text-gray-500 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-sm transition-colors uppercase tracking-wide">Feed</a>
            <a href="#analytics-section" className="text-xs text-gray-500 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-sm transition-colors uppercase tracking-wide">Analytics</a>
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

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Total</span>
            <span className="text-sm font-bold text-gray-900">{stats.total}</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded-sm bg-amber-50 text-amber-700 border-amber-200">
            Pending <strong>{stats.pending}</strong>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded-sm bg-blue-50 text-blue-700 border-blue-200">
            In Progress <strong>{stats.inProgress}</strong>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded-sm bg-green-50 text-green-700 border-green-200">
            Resolved <strong>{stats.resolved}</strong>
          </span>
          <span className="ml-auto text-[10px] font-mono text-gray-400">Auto-refreshes every 30s</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* ── Section 1: Map Heatmap ─────────────────────────────────────── */}
        <section id="map-section">
          <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-0.5">Section 01</p>
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">Crime Heatmap</h2>
              <p className="text-xs text-gray-500 mt-0.5">Regions coloured by most frequent crime type · Individual markers show each report</p>
            </div>
          </div>

          {/* Map filters */}
          <div className="bg-white border border-gray-200 p-4 mb-3">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex border border-gray-200 rounded-sm overflow-hidden">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors uppercase tracking-wide border-r border-gray-200 last:border-r-0 ${
                      statusFilter === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-200 rounded-sm px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-700 uppercase tracking-wide"
              >
                {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <div className="flex items-center gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="border border-gray-200 rounded-sm px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-700"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="border border-gray-200 rounded-sm px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-700"
                />
              </div>
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(''); setDateTo(''); }}
                  className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1.5 border border-gray-200 rounded-sm transition-colors"
                >
                  Clear
                </button>
              )}
              <span className="ml-auto text-[10px] font-mono text-gray-400">
                {filtered.length} of {complaints.length} complaints
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-center gap-2 mb-3 rounded-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center bg-white border border-gray-200 rounded-lg" style={{ height: '500px' }}>
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-mono uppercase tracking-widest text-gray-400">Loading map data…</p>
              </div>
            </div>
          ) : (
            <MapHeatmap complaints={filtered} height="500px" />
          )}

          {/* Heatmap legend */}
          <div className="bg-white border border-gray-200 border-t-0 px-6 py-3 flex flex-wrap gap-4 items-center rounded-b-lg">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Crime Type Legend</span>
            {Object.entries(CRIME_TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                <span className="text-xs text-gray-600">{type}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: Complaints Feed ─────────────────────────────────── */}
        <section id="feed-section">
          <div className="mb-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-0.5">Section 02</p>
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">Global Complaints Feed</h2>
            <p className="text-xs text-gray-500 mt-0.5">Live feed of all complaints registered across the platform</p>
          </div>
          <ComplaintsFeed />
        </section>

        {/* ── Section 3: Analytics ───────────────────────────────────────── */}
        <section id="analytics-section">
          <div className="mb-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-0.5">Section 03</p>
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">Analytics &amp; Insights</h2>
            <p className="text-xs text-gray-500 mt-0.5">Filter by Indian state or city · data matched by GPS coordinates</p>
          </div>
          <AnalyticsContent />
        </section>
      </main>
    </div>
  );
}
