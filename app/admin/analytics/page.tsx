'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import type { ComplaintWithImages } from '@/types';

const ISSUE_TYPES = ['All', 'Robbery', 'Murder', 'Assault', 'Theft', 'Harassment', 'Missing Person', 'Other'];
const STATUS_OPTIONS = ['All', 'Pending', 'In Progress', 'Resolved'];

const STATUS_COLORS: Record<string, string> = {
  Pending: '#EAB308',
  'In Progress': '#3B82F6',
  Resolved: '#22C55E',
};

const ISSUE_COLORS = [
  '#6366f1', '#f59e0b', '#ef4444', '#10b981',
  '#3b82f6', '#8b5cf6', '#f97316',
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function groupByStatus(complaints: ComplaintWithImages[]) {
  const counts: Record<string, number> = {};
  complaints.forEach((c) => {
    counts[c.status] = (counts[c.status] ?? 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function groupByIssueType(complaints: ComplaintWithImages[]) {
  const counts: Record<string, number> = {};
  complaints.forEach((c) => {
    counts[c.issue_type] = (counts[c.issue_type] ?? 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function groupByDate(complaints: ComplaintWithImages[]) {
  const counts: Record<string, number> = {};
  complaints.forEach((c) => {
    const date = c.created_at.slice(0, 10); // "YYYY-MM-DD"
    counts[date] = (counts[date] ?? 0) + 1;
  });
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const router = useRouter();

  const [filtered, setFiltered] = useState<ComplaintWithImages[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [issueType, setIssueType] = useState('All');
  const [status, setStatus] = useState('All');

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ include_images: 'false' });
      if (dateFrom) params.set('date_from', new Date(dateFrom).toISOString());
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        params.set('date_to', end.toISOString());
      }
      if (issueType !== 'All') params.set('issue_type', issueType);
      if (status !== 'All') params.set('status', status);

      const res = await fetch(`/api/complaints?${params}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Fetch failed');
      }
      const data = await res.json();
      const complaints: ComplaintWithImages[] = data.complaints ?? [];
      setFiltered(complaints);

      // Fetch total count (no filters) only when filters are applied
      if (dateFrom || dateTo || issueType !== 'All' || status !== 'All') {
        const totalRes = await fetch('/api/complaints?include_images=false');
        if (totalRes.ok) {
          const totalData = await totalRes.json();
          setTotalCount((totalData.complaints ?? []).length);
        }
      } else {
        setTotalCount(complaints.length);
      }
    } catch {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, issueType, status, router]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  function handleClear() {
    setDateFrom('');
    setDateTo('');
    setIssueType('All');
    setStatus('All');
  }

  // ── Derived data ───────────────────────────────────────────────────────────
  const statusData = groupByStatus(filtered);
  const issueData = groupByIssueType(filtered);
  const timeData = groupByDate(filtered);

  const stats = {
    total: filtered.length,
    pending: filtered.filter((c) => c.status === 'Pending').length,
    inProgress: filtered.filter((c) => c.status === 'In Progress').length,
    resolved: filtered.filter((c) => c.status === 'Resolved').length,
  };

  const hasFilters = !!(dateFrom || dateTo || issueType !== 'All' || status !== 'All');

  // ── Render ─────────────────────────────────────────────────────────────────
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

      <main className="max-w-7xl mx-auto py-6 px-6 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Filters</h2>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">Issue Type</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            {hasFilters && (
              <button
                onClick={handleClear}
                className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2 border border-slate-300 rounded transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-16 text-center">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading analytics…</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Complaints', value: stats.total, color: 'bg-slate-800' },
                { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
                { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-600' },
                { label: 'Resolved', value: stats.resolved, color: 'bg-green-600' },
              ].map((s) => (
                <div key={s.label} className={`${s.color} text-white rounded-lg px-5 py-4 shadow-sm`}>
                  <p className="text-xs opacity-80">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Charts row 1: Status Pie + Issue Type Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Complaints by Status */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Complaints by Status</h3>
                {statusData.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No data</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }: { name?: string; percent?: number }) =>
                          `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`
                        }
                        labelLine={true}
                      >
                        {statusData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={STATUS_COLORS[entry.name] ?? '#94a3b8'}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Complaints']} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Complaints by Issue Type */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Complaints by Issue Type</h3>
                {issueData.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No data</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={issueData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" name="Complaints" radius={[4, 4, 0, 0]}>
                        {issueData.map((entry, index) => (
                          <Cell key={entry.name} fill={ISSUE_COLORS[index % ISSUE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Complaints over Time */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Complaints over Time</h3>
              {timeData.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={timeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Complaints"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Filter context note */}
            {hasFilters && totalCount > 0 && filtered.length !== totalCount && (
              <p className="text-xs text-slate-400 text-right">
                Showing {filtered.length} of {totalCount} total complaints based on active filters.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
