'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ComplaintWithImages } from '@/types';

const ISSUE_TYPES = ['All', 'Robbery', 'Murder', 'Assault', 'Theft', 'Harassment', 'Missing Person', 'Other'];
const STATUS_OPTIONS = ['All', 'Pending', 'In Progress', 'Resolved'];

// Muted editorial chart palette
const STATUS_COLORS: Record<string, string> = {
  Pending: '#B45309',       // amber-700
  'In Progress': '#1D4ED8', // blue-700
  Resolved: '#15803D',      // green-700
};

const ISSUE_COLORS = [
  '#1D4ED8', '#15803D', '#B91C1C', '#B45309',
  '#7C3AED', '#0E7490', '#374151',
];

function groupByStatus(complaints: ComplaintWithImages[]) {
  const counts: Record<string, number> = {};
  complaints.forEach((c) => { counts[c.status] = (counts[c.status] ?? 0) + 1; });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function groupByIssueType(complaints: ComplaintWithImages[]) {
  const counts: Record<string, number> = {};
  complaints.forEach((c) => { counts[c.issue_type] = (counts[c.issue_type] ?? 0) + 1; });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function groupByDate(complaints: ComplaintWithImages[]) {
  const counts: Record<string, number> = {};
  complaints.forEach((c) => {
    const date = c.created_at.slice(0, 10);
    counts[date] = (counts[date] ?? 0) + 1;
  });
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export default function AnalyticsContent() {
  const [filtered, setFiltered] = useState<ComplaintWithImages[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [issueType, setIssueType] = useState('All');
  const [status, setStatus] = useState('All');

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
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      const complaints: ComplaintWithImages[] = data.complaints ?? [];
      setFiltered(complaints);

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
  }, [dateFrom, dateTo, issueType, status]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  function handleClear() {
    setDateFrom(''); setDateTo(''); setIssueType('All'); setStatus('All');
  }

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

  const resolvedRate = stats.total > 0
    ? Math.round((stats.resolved / stats.total) * 100)
    : 0;

  return (
    <main className="max-w-7xl mx-auto py-8 px-6 space-y-6">
      {/* Filters */}
      <div className="bg-white border border-gray-200">
        <div className="px-6 py-3 border-b border-gray-200">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Filters</p>
        </div>
        <div className="px-6 py-4 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-200 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white text-gray-700"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-200 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white text-gray-700"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Issue Type</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="border border-gray-200 rounded-sm px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 text-gray-700"
            >
              {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          {/* Status toggle group */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Status</label>
            <div className="flex border border-gray-200 rounded-sm overflow-hidden">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-2 text-xs font-medium transition-colors uppercase tracking-wide border-r border-gray-200 last:border-r-0 ${
                    status === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {hasFilters && (
            <button
              onClick={handleClear}
              className="text-xs text-gray-500 hover:text-gray-900 px-3 py-2 border border-gray-200 rounded-sm transition-colors uppercase tracking-wide self-end"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-sm px-4 py-3.5 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-gray-200 p-16 text-center">
          <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400">Loading analytics…</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-gray-200">
            {[
              { label: 'Total Complaints', value: stats.total, accent: 'border-t-4 border-t-gray-900' },
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

          {/* Resolution Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200">
            <div className="bg-white p-6 border-t-4 border-t-gray-900">
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">Resolution Rate</p>
              <p className="text-5xl font-light text-gray-900">{resolvedRate}<span className="text-2xl text-gray-400">%</span></p>
              <p className="text-xs text-gray-500 mt-2">{stats.resolved} of {stats.total} complaints resolved</p>
            </div>
            <div className="bg-white p-6 border-l border-gray-200 border-t-4 border-t-blue-700">
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">Active Cases</p>
              <p className="text-5xl font-light text-gray-900">{stats.pending + stats.inProgress}</p>
              <p className="text-xs text-gray-500 mt-2">{stats.pending} pending + {stats.inProgress} in progress</p>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Status Pie */}
            <div className="bg-white border border-gray-200 border-t-4 border-t-gray-900 p-6">
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-6">Complaints by Status</p>
              {statusData.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No data</p>
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
                      innerRadius={50}
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`
                      }
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#6B7280'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Complaints']} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Issue Type Bar */}
            <div className="bg-white border border-gray-200 border-t-4 border-t-blue-700 p-6">
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-6">Complaints by Issue Type</p>
              {issueData.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={issueData} margin={{ top: 0, right: 0, left: -20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="" vertical={false} stroke="#F3F4F6" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#9CA3AF' }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 0, fontSize: 11 }} />
                    <Bar dataKey="value" name="Complaints" radius={[0, 0, 0, 0]}>
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
          <div className="bg-white border border-gray-200 border-t-4 border-t-green-700 p-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-6">Complaints over Time</p>
            {timeData.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={timeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 0, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Complaints"
                    stroke="#1D4ED8"
                    strokeWidth={1.5}
                    dot={{ r: 2, fill: '#1D4ED8' }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Filter context note */}
          {hasFilters && totalCount > 0 && filtered.length !== totalCount && (
            <p className="text-[10px] font-mono text-gray-400 text-right">
              Showing {filtered.length} of {totalCount} total complaints based on active filters.
            </p>
          )}
        </>
      )}
    </main>
  );
}
