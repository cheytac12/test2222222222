'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { Complaint, ComplaintImage } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';

// Load MiniMap dynamically to avoid SSR Leaflet errors
const MiniMap = dynamic(() => import('@/components/MiniMap'), { ssr: false });

function TrackContent() {
  const searchParams = useSearchParams();
  const [complaintId, setComplaintId] = useState(searchParams.get('id') ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [images, setImages] = useState<ComplaintImage[]>([]);

  // Auto-fetch if ID in query param
  useEffect(() => {
    const idFromQuery = searchParams.get('id');
    if (idFromQuery) {
      setComplaintId(idFromQuery);
      fetchComplaint(idFromQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchComplaint(id: string) {
    const trimmedId = id.trim().toUpperCase();
    if (!trimmedId) {
      setError('Please enter a complaint ID.');
      return;
    }

    setLoading(true);
    setError('');
    setComplaint(null);
    setImages([]);

    try {
      const res = await fetch(`/api/complaints/${encodeURIComponent(trimmedId)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Complaint not found. Please check the ID and try again.');
        return;
      }

      setComplaint(data.complaint);
      setImages(data.images ?? []);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchComplaint(complaintId);
  }

  const statusConfig: Record<string, { dot: string; label: string }> = {
    Pending: { dot: 'bg-amber-400', label: 'Pending review by administrators' },
    'In Progress': { dot: 'bg-blue-500', label: 'Being actively investigated' },
    Resolved: { dot: 'bg-emerald-500', label: 'Case has been resolved' },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-950 text-white px-6 py-0">
        <div className="max-w-2xl mx-auto flex items-center gap-3 h-14">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Home
          </Link>
          <svg className="w-3.5 h-3.5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-sm text-slate-300 font-medium">Track Your Complaint</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-10 px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Track Complaint</h1>
          <p className="text-sm text-slate-500">Enter your Complaint ID to check the current status.</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              placeholder="e.g. CR-10294"
              className="flex-1 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono tracking-wider placeholder:normal-case placeholder:tracking-normal placeholder:font-sans"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              )}
              Search
            </button>
          </form>
          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex gap-2.5 items-start">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {complaint && (
          <div className="space-y-4">
            {/* Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className={`px-6 py-5 border-b ${getStatusColor(complaint.status)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">Current Status</p>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${statusConfig[complaint.status]?.dot ?? 'bg-gray-400'} animate-pulse`} />
                      <p className="text-xl font-bold">{complaint.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-70 font-medium">{statusConfig[complaint.status]?.label}</p>
                  </div>
                </div>
              </div>

              {/* Complaint Details */}
              <div className="p-6">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Complaint Details</h3>
                <dl className="space-y-3">
                  <DetailRow label="Complaint ID" value={complaint.complaint_id} mono />
                  <DetailRow label="Registered Name" value={complaint.name} />
                  <DetailRow label="Issue Type" value={complaint.issue_type} />
                  <DetailRow label="Registered On" value={formatDate(complaint.created_at)} />
                </dl>
              </div>

              <div className="px-6 pb-6">
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{complaint.description}</p>
                </div>
              </div>
            </div>

            {/* Images */}
            {images.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Uploaded Evidence</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img) => (
                    <a
                      key={img.id}
                      href={img.public_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl overflow-hidden border border-slate-200 hover:border-blue-300 transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.public_url}
                        alt="Complaint evidence"
                        className="w-full h-32 object-cover hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Mini Map */}
            {complaint.latitude != null && complaint.longitude != null && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Incident Location</h3>
                <div className="rounded-xl overflow-hidden">
                  <MiniMap
                    latitude={complaint.latitude}
                    longitude={complaint.longitude}
                    complaintId={complaint.complaint_id}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-slate-500 flex-shrink-0 w-36">{label}</dt>
      <dd className={`text-slate-900 font-medium text-right ${mono ? 'font-mono tracking-wider' : ''}`}>{value}</dd>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading…</p>
          </div>
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
