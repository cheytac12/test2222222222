'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { Complaint, ComplaintImage } from '@/types';
import { formatDate } from '@/lib/utils';

const MiniMap = dynamic(() => import('@/components/MiniMap'), { ssr: false });

function TrackContent() {
  const searchParams = useSearchParams();
  const [complaintId, setComplaintId] = useState(searchParams.get('id') ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [images, setImages] = useState<ComplaintImage[]>([]);

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

  const statusConfig: Record<string, { badge: string; label: string }> = {
    Pending: {
      badge: 'bg-amber-50 text-amber-700 border border-amber-200',
      label: 'Pending review by administrators',
    },
    'In Progress': {
      badge: 'bg-blue-50 text-blue-700 border border-blue-200',
      label: 'Being actively investigated',
    },
    Resolved: {
      badge: 'bg-green-50 text-green-700 border border-green-200',
      label: 'Case has been resolved',
    },
  };

  const statusAccent: Record<string, string> = {
    Pending: 'border-t-amber-500',
    'In Progress': 'border-t-blue-700',
    Resolved: 'border-t-green-700',
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-0">
        <div className="max-w-2xl mx-auto flex items-center gap-3 h-14">
          <Link href="/" className="text-gray-400 hover:text-gray-900 transition-colors text-xs flex items-center gap-1.5 uppercase tracking-wide">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-xs text-gray-700 font-medium uppercase tracking-wide">Track Complaint</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-10 px-6">
        <div className="mb-8">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">Complaint Lookup</p>
          <h1 className="text-2xl font-bold text-gray-900">Track Your Complaint</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your Complaint ID to check the current status.</p>
        </div>

        {/* Search Box */}
        <div className="bg-white border border-gray-200 p-6 mb-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              placeholder="e.g. CR-10294"
              className="flex-1 border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 uppercase font-mono tracking-wider placeholder:normal-case placeholder:tracking-normal placeholder:font-sans"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-sm font-medium text-xs uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              )}
              Search
            </button>
          </form>
          {error && (
            <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-4 py-3 flex gap-2.5 items-start">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {complaint && (
          <div className="space-y-4">
            {/* Status Card */}
            <div className={`bg-white border border-gray-200 border-t-4 ${statusAccent[complaint.status] ?? 'border-t-gray-400'}`}>
              <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1">Current Status</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-bold uppercase tracking-widest ${statusConfig[complaint.status]?.badge ?? 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                    {complaint.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 text-right max-w-[200px]">{statusConfig[complaint.status]?.label}</p>
              </div>

              <div className="p-6">
                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-4">Complaint Details</p>
                <dl className="space-y-3 border-t border-gray-100 pt-4">
                  <DetailRow label="Complaint ID" value={complaint.complaint_id} mono />
                  <DetailRow label="Registered Name" value={complaint.name} />
                  <DetailRow label="Issue Type" value={complaint.issue_type} />
                  <DetailRow label="Registered On" value={formatDate(complaint.created_at)} />
                </dl>
              </div>

              <div className="px-6 pb-6">
                <div className="bg-[#F7F7F5] border border-gray-200 p-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{complaint.description}</p>
                </div>
              </div>
            </div>

            {/* Images */}
            {images.length > 0 && (
              <div className="bg-white border border-gray-200 border-t-4 border-t-yellow-600 p-6">
                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-4">Uploaded Evidence</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img) => (
                    <a
                      key={img.id}
                      href={img.public_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors"
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
              <div className="bg-white border border-gray-200 border-t-4 border-t-gray-900 p-6">
                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-4">Incident Location</p>
                <div className="border border-gray-200 overflow-hidden">
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

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
      <dt className="text-xs text-gray-500 flex-shrink-0 font-mono uppercase tracking-wide">{label}</dt>
      <dd className={`text-sm text-gray-900 font-medium text-right ${mono ? 'font-mono tracking-wider' : ''}`}>{value}</dd>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono uppercase tracking-widest text-gray-400">Loading…</p>
          </div>
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
