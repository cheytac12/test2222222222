'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Complaint } from '@/types';
import { formatDate } from '@/lib/utils';

const STATUS_OPTIONS = ['All', 'Pending', 'In Progress', 'Resolved'];
const ISSUE_TYPES = ['All', 'Robbery', 'Murder', 'Assault', 'Theft', 'Harassment', 'Missing Person', 'Other'];
const VALID_STATUSES = ['Pending', 'In Progress', 'Resolved'];

const STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Resolved: 'bg-green-50 text-green-700 border-green-200',
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');

  const [updating, setUpdating] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (typeFilter !== 'All') params.set('issue_type', typeFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/complaints?${params}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Fetch failed');
      }
      const data = await res.json();
      setComplaints(data.complaints ?? []);
    } catch {
      setError('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, search, router]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  async function submitStatusUpdate() {
    if (!updating || !updateStatus) return;
    setUpdateLoading(true);
    setUpdateError('');
    try {
      const res = await fetch(`/api/complaints/${encodeURIComponent(updating)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: updateStatus, notes: updateNotes }),
      });
      if (!res.ok) {
        const d = await res.json();
        setUpdateError(d.error ?? 'Update failed.');
        return;
      }
      setUpdating(null);
      setUpdateStatus('');
      setUpdateNotes('');
      fetchComplaints();
    } catch {
      setUpdateError('Network error.');
    } finally {
      setUpdateLoading(false);
    }
  }

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'Pending').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress').length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
  };

  async function downloadCSV() {
    try {
      const res = await fetch('/api/complaints?include_images=false');
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      const all: Complaint[] = data.complaints ?? [];

      const escape = (v: string | number | null | undefined) => {
        const s = v == null ? '' : String(v);
        return `"${s.replace(/"/g, '""')}"`;
      };
      const headers = ['Complaint ID', 'Name', 'Email', 'Phone', 'Issue Type', 'Description', 'City', 'Latitude', 'Longitude', 'Status', 'Registered'].map(escape);
      const rows = all.map((c) => [
        escape(c.complaint_id),
        escape(c.name),
        escape(c.email),
        escape(c.phone),
        escape(c.issue_type),
        escape(c.description),
        escape(c.city),
        escape(c.latitude),
        escape(c.longitude),
        escape(c.status),
        escape(c.created_at),
      ].join(','));

      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `complaints_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export CSV. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              href="/admin/map"
              className="text-xs border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white text-gray-600 px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 uppercase tracking-wide"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
              Map
            </Link>
            <Link
              href="/admin/analytics"
              className="text-xs border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white text-gray-600 px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 uppercase tracking-wide"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Analytics
            </Link>
            <button
              onClick={downloadCSV}
              className="text-xs border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white text-gray-600 px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 uppercase tracking-wide"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={handleLogout}
              className="text-xs border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 text-red-600 px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 uppercase tracking-wide"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mb-8 border border-gray-200">
          {[
            { label: 'Total Reports', value: stats.total, accent: 'border-t-4 border-t-gray-900' },
            { label: 'Pending', value: stats.pending, accent: 'border-t-4 border-t-amber-500' },
            { label: 'In Progress', value: stats.inProgress, accent: 'border-t-4 border-t-blue-700' },
            { label: 'Resolved', value: stats.resolved, accent: 'border-t-4 border-t-green-700' },
          ].map((s, i) => (
            <div key={s.label} className={`bg-white p-6 border-gray-200 ${i > 0 ? 'border-l' : ''} ${s.accent}`}>
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">{s.label}</p>
              <p className="text-4xl font-light text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters / Search */}
        <div className="bg-white border border-gray-200 p-4 mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-48">
              <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchComplaints()}
                placeholder="Search by Complaint ID…"
                className="w-full border border-gray-200 rounded-sm pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-700 placeholder:text-gray-400"
              />
            </div>

            {/* Status toggle */}
            <div className="flex border border-gray-200 rounded-sm overflow-hidden">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 text-xs font-medium transition-colors uppercase tracking-wide border-r border-gray-200 last:border-r-0 ${
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
              className="border border-gray-200 rounded-sm px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-700 uppercase tracking-wide"
            >
              {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>

            <button
              onClick={fetchComplaints}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Search
            </button>
            <button
              onClick={() => { setSearch(''); setStatusFilter('All'); setTypeFilter('All'); }}
              className="text-xs text-gray-500 hover:text-gray-900 px-3 py-2 border border-gray-200 rounded-sm transition-colors uppercase tracking-wide"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-sm px-4 py-3 mb-4 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="bg-white border border-gray-200 p-16 text-center">
            <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono uppercase tracking-widest text-gray-400">Loading complaints…</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white border border-gray-200 p-16 text-center">
            <p className="text-sm font-medium text-gray-700 mb-1">No complaints found</p>
            <p className="text-xs text-gray-400">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['Complaint ID', 'Name', 'Email', 'Phone', 'Issue Type', 'Description', 'Location', 'Status', 'Registered', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-gray-400 whitespace-nowrap border-b border-gray-100">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900 whitespace-nowrap text-xs tracking-wider">
                        {c.complaint_id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800 text-xs">{c.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">{c.email ?? '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">{c.phone ?? '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-sm text-xs font-medium uppercase tracking-wide">
                          {c.issue_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="truncate text-gray-600 text-xs">{c.description}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-xs font-mono">
                        {c.latitude != null && c.longitude != null
                          ? `${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-sm text-xs font-semibold border ${STATUS_BADGE[c.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-xs font-mono">
                        {formatDate(c.created_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setUpdating(c.complaint_id);
                            setUpdateStatus(c.status);
                            setUpdateNotes('');
                            setUpdateError('');
                          }}
                          className="border border-gray-200 hover:bg-gray-900 hover:text-white hover:border-gray-900 text-gray-700 px-3 py-1.5 rounded-sm text-xs font-medium transition-all uppercase tracking-wide"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 bg-[#F7F7F5]">
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
                {complaints.length} complaint{complaints.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Status Update Modal */}
      {updating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 border-t-4 border-t-gray-900 max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1">Update Complaint</p>
                <h3 className="text-base font-bold text-gray-900">{updating}</h3>
              </div>
              <button
                onClick={() => setUpdating(null)}
                className="text-gray-400 hover:text-gray-900 transition-colors ml-4 mt-0.5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {updateError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-4 py-3 flex gap-2.5 items-start">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {updateError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">New Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                >
                  {VALID_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                  Notes <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes about this status change…"
                  className="w-full border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={submitStatusUpdate}
                disabled={updateLoading}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-sm font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updateLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
                Save Changes
              </button>
              <button
                onClick={() => setUpdating(null)}
                className="flex-1 border border-gray-200 hover:border-gray-400 text-gray-600 px-4 py-2.5 rounded-sm font-medium text-xs uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
