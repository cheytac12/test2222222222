'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Complaint } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';

const STATUS_OPTIONS = ['All', 'Pending', 'In Progress', 'Resolved'];
const ISSUE_TYPES = ['All', 'Robbery', 'Murder', 'Assault', 'Theft', 'Harassment', 'Missing Person', 'Other'];
const VALID_STATUSES = ['Pending', 'In Progress', 'Resolved'];

export default function AdminDashboardPage() {
  const router = useRouter();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Status update modal
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
      const sessionToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('admin_session='))
        ?.split('=')[1] ?? '';

      const res = await fetch(`/api/complaints/${encodeURIComponent(updating)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ status: updateStatus, notes: updateNotes }),
      });

      if (!res.ok) {
        const d = await res.json();
        setUpdateError(d.error ?? 'Update failed.');
        return;
      }

      // Refresh list
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

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Nav */}
      <nav className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🛡️</span>
          <span className="text-lg font-bold">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/admin/map" className="bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors">
            🗺️ View Map
          </Link>
          <Link href="/map" target="_blank" className="text-slate-300 hover:text-white transition-colors">
            Public Map ↗
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-700 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'bg-slate-800' },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-600' },
            { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-600' },
            { label: 'Resolved', value: stats.resolved, color: 'bg-green-600' },
          ].map((s) => (
            <div key={s.label} className={`${s.color} text-white rounded-xl px-5 py-4 shadow`}>
              <p className="text-sm opacity-80">{s.label}</p>
              <p className="text-3xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters / Search */}
        <div className="bg-white rounded-xl border border-slate-200 shadow p-4 mb-6 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchComplaints()}
            placeholder="Search by Complaint ID…"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ISSUE_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <button
            onClick={fetchComplaints}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🔍 Search
          </button>
          <button
            onClick={() => { setSearch(''); setStatusFilter('All'); setTypeFilter('All'); }}
            className="text-sm text-slate-500 hover:text-slate-700 px-2 py-2 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow p-12 text-center">
            <div className="text-4xl animate-pulse mb-3">📋</div>
            <p className="text-slate-500">Loading complaints…</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-500">No complaints found matching your filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Complaint ID', 'Name', 'Phone', 'Issue Type', 'Description', 'Location', 'Status', 'Registered', 'Actions'].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {c.complaint_id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{c.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">{c.phone}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          {c.issue_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="truncate text-slate-600">{c.description}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-400 text-xs">
                        {c.latitude != null && c.longitude != null
                          ? `${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-400 text-xs">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setUpdating(c.complaint_id);
                            setUpdateStatus(c.status);
                            setUpdateNotes('');
                            setUpdateError('');
                          }}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Status Update Modal */}
      {updating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Update Status — <span className="font-mono text-blue-600">{updating}</span>
            </h3>

            {updateError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                ⚠️ {updateError}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {VALID_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes about this status change…"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={submitStatusUpdate}
                disabled={updateLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {updateLoading ? '⏳ Saving…' : '✅ Save Changes'}
              </button>
              <button
                onClick={() => setUpdating(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
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
