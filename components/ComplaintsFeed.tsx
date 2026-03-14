'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ComplaintWithImages } from '@/types';
import { formatDate } from '@/lib/utils';
import { INDIAN_CITIES, reverseGeocodeCity } from '@/lib/cities';

/** Colour badge per crime type */
const TYPE_BADGE: Record<string, string> = {
  Robbery: 'bg-red-50 text-red-700 border-red-200',
  Murder: 'bg-red-100 text-red-900 border-red-300',
  Assault: 'bg-orange-50 text-orange-700 border-orange-200',
  Theft: 'bg-purple-50 text-purple-700 border-purple-200',
  Harassment: 'bg-pink-50 text-pink-700 border-pink-200',
  'Missing Person': 'bg-blue-50 text-blue-700 border-blue-200',
  Other: 'bg-gray-50 text-gray-600 border-gray-200',
};

/** Colour badge per status */
const STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Resolved: 'bg-green-50 text-green-700 border-green-200',
};

const ISSUE_TYPES = ['All', 'Robbery', 'Murder', 'Assault', 'Theft', 'Harassment', 'Missing Person', 'Other'];

// Re-export utilities for consumers that may need them
export { INDIAN_CITIES, reverseGeocodeCity };

/**
 * ComplaintsFeed – a scrollable list of the most recent complaints from all
 * users. Supports filtering by issue type and date range.
 */
export default function ComplaintsFeed() {
  const [complaints, setComplaints] = useState<ComplaintWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ include_images: 'false' });
      if (typeFilter !== 'All') params.set('issue_type', typeFilter);
      if (startDate) params.set('date_from', startDate);
      if (endDate) {
        // Use start-of-next-day so the full endDate is included, regardless of server timezone
        const next = new Date(endDate);
        next.setDate(next.getDate() + 1);
        params.set('date_to', next.toISOString().split('T')[0]);
      }
      const res = await fetch(`/api/complaints?${params}`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setComplaints(data.complaints ?? []);
    } catch {
      setError('Failed to load complaints feed.');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, startDate, endDate]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return (
    <div className="bg-white border border-gray-200 border-t-4 border-t-gray-900">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-0.5">Live Feed</p>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Global Complaints Feed</h2>
        </div>
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-200 rounded-sm px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-700"
            >
              {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-200 rounded-sm px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-200 rounded-sm px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-700"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-[10px] font-mono uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors"
              title="Clear date filters"
            >
              ✕ Clear dates
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="p-10 text-center">
          <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400">Loading feed…</p>
        </div>
      ) : error ? (
        <div className="p-6 text-sm text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-10 text-center text-sm text-gray-400">No complaints found.</div>
      ) : (
        <div className="max-h-[560px] overflow-y-auto">
          <div className="divide-y divide-gray-100">
            {complaints.map((c) => (
              <div key={c.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Left: ID + type */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-gray-900 tracking-wider">{c.complaint_id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold border uppercase tracking-wide ${
                        TYPE_BADGE[c.issue_type] ?? 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {c.issue_type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold border uppercase tracking-wide ${
                        STATUS_BADGE[c.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  {/* Right: dates */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Registered</p>
                    <p className="text-xs text-gray-700 font-medium">{formatDate(c.created_at)}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-2 text-xs text-gray-600 leading-relaxed line-clamp-2">
                  {c.description}
                </p>

                {/* Meta row */}
                <div className="mt-2 flex flex-wrap gap-3 items-center">
                  {c.city && (
                    <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                      </svg>
                      {c.city}
                    </span>
                  )}
                  {c.latitude != null && c.longitude != null && (
                    <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(c.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {!loading && !error && (
        <div className="px-6 py-3 border-t border-gray-100 bg-[#F7F7F5]">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
            {complaints.length} complaint{complaints.length !== 1 ? 's' : ''} · sorted by most recent
            {(startDate || endDate) && ` · ${startDate || '…'} → ${endDate || '…'}`}
          </p>
        </div>
      )}
    </div>
  );
}
