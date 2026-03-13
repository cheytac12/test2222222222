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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">
          ← Home
        </Link>
        <span className="text-slate-700">|</span>
        <h1 className="text-sm font-semibold">Track Your Complaint</h1>
      </header>

      <main className="max-w-2xl mx-auto py-10 px-6">
        {/* Search Box */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Enter Complaint ID</h2>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              placeholder="e.g. CR-10294"
              className="flex-1 border border-slate-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              Search
            </button>
          </form>
          {error && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Results */}
        {complaint && (
          <div className="space-y-4">
            {/* Status Banner */}
            <div
              className={`rounded-lg border px-6 py-4 flex items-center justify-between ${getStatusColor(complaint.status)}`}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-70">
                  Current Status
                </p>
                <p className="text-lg font-bold">{complaint.status}</p>
              </div>
              <div
                className="w-8 h-8 rounded-full border-2 border-current opacity-40"
                aria-hidden="true"
              />
            </div>

            {/* Complaint Details */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 divide-y divide-slate-100">
              <div className="px-6 py-4">
                <h3 className="font-semibold text-slate-800 mb-3">Complaint Details</h3>
                <dl className="space-y-2 text-sm">
                  <DetailRow label="Complaint ID" value={complaint.complaint_id} mono />
                  <DetailRow label="Registered Name" value={complaint.name} />
                  <DetailRow label="Issue Type" value={complaint.issue_type} />
                  <DetailRow
                    label="Registered On"
                    value={formatDate(complaint.created_at)}
                  />
                </dl>
              </div>

              <div className="px-6 py-4">
                <p className="text-xs font-medium text-slate-500 mb-2">Description</p>
                <p className="text-sm text-slate-700 leading-relaxed">{complaint.description}</p>
              </div>
            </div>

            {/* Images */}
            {images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Uploaded Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img) => (
                    <a
                      key={img.id}
                      href={img.public_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.public_url}
                        alt="Complaint evidence"
                        className="w-full h-32 object-cover rounded border border-slate-200 hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Mini Map */}
            {complaint.latitude != null && complaint.longitude != null && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Incident Location</h3>
                <MiniMap
                  latitude={complaint.latitude}
                  longitude={complaint.longitude}
                  complaintId={complaint.complaint_id}
                />
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
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500 flex-shrink-0 w-36">{label}</dt>
      <dd className={`text-slate-800 font-medium text-right ${mono ? 'font-mono' : ''}`}>
        {value}
      </dd>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Loading…</div>}>
      <TrackContent />
    </Suspense>
  );
}
