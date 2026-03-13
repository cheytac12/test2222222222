'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ISSUE_TYPES = [
  'Robbery',
  'Murder',
  'Assault',
  'Theft',
  'Harassment',
  'Missing Person',
  'Other',
];

export default function ComplaintPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    issue_type: '',
    description: '',
    latitude: '',
    longitude: '',
    website: '', // honeypot – must remain empty
  });

  const [images, setImages] = useState<File[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ complaint_id: string } | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setImages((prev) => [...prev, ...files]);
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Please allow location access.'
            : 'Unable to retrieve your location. Please try again.'
        );
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!form.name.trim() || !form.phone.trim() || !form.issue_type || !form.description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('phone', form.phone.trim());
      fd.append('issue_type', form.issue_type);
      fd.append('description', form.description.trim());
      if (form.latitude) fd.append('latitude', form.latitude);
      if (form.longitude) fd.append('longitude', form.longitude);
      fd.append('website', form.website); // honeypot field
      images.forEach((img) => fd.append('images', img));

      const res = await fetch('/api/complaints', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Submission failed. Please try again.');
        return;
      }

      setSuccess({ complaint_id: data.complaint_id });
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success Screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow border border-slate-200 max-w-md w-full p-8">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Complaint Submitted</h1>
          <p className="text-sm text-slate-500 mb-5">
            Your complaint has been registered. An SMS confirmation has been sent to your phone.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
            <p className="text-xs text-slate-500 mb-1">Your Complaint ID</p>
            <p className="text-2xl font-bold font-mono text-slate-800">{success.complaint_id}</p>
            <p className="text-xs text-slate-400 mt-1">Save this ID to track your complaint</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push(`/track?id=${success.complaint_id}`)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors"
            >
              Track My Complaint
            </button>
            <Link
              href="/"
              className="text-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded font-medium text-sm transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">
          ← Home
        </Link>
        <span className="text-slate-700">|</span>
        <h1 className="text-sm font-semibold">Register a Complaint</h1>
      </header>

      <main className="max-w-2xl mx-auto py-10 px-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 text-white px-6 py-4">
            <h2 className="text-base font-semibold">Crime Complaint Registration</h2>
            <p className="text-slate-400 text-xs mt-1">
              All fields marked with <span className="text-white">*</span> are required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Personal Info */}
            <fieldset className="space-y-4">
              <legend className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Personal Information
              </legend>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. John Smith"
                  required
                  className="w-full border border-slate-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1 555-123-4567"
                  required
                  className="w-full border border-slate-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-400 mt-1">
                  An SMS confirmation will be sent to this number.
                </p>
              </div>
            </fieldset>

            {/* Complaint Details */}
            <fieldset className="space-y-4">
              <legend className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Complaint Details
              </legend>

              <div>
                <label htmlFor="issue_type" className="block text-sm font-medium text-slate-700 mb-1">
                  Issue Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="issue_type"
                  name="issue_type"
                  value={form.issue_type}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select issue type</option>
                  {ISSUE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  required
                  placeholder="Describe the incident in detail – what happened, when, who was involved, etc."
                  className="w-full border border-slate-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>
            </fieldset>

            {/* Location */}
            <fieldset className="space-y-4">
              <legend className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Location (Optional)
              </legend>

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gpsLoading}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 px-4 py-2.5 rounded font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {gpsLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    Getting Location…
                  </>
                ) : (
                  'Use Current Location'
                )}
              </button>

              {gpsError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {gpsError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-slate-700 mb-1">
                    Latitude
                  </label>
                  <input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={handleChange}
                    placeholder="e.g. 40.712776"
                    className="w-full border border-slate-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-slate-700 mb-1">
                    Longitude
                  </label>
                  <input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={handleChange}
                    placeholder="e.g. -74.005974"
                    className="w-full border border-slate-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                  />
                </div>
              </div>
              {form.latitude && form.longitude && (
                <p className="text-xs text-green-600">
                  Location captured: {form.latitude}, {form.longitude}
                </p>
              )}
            </fieldset>

            {/* Image Upload */}
            <fieldset className="space-y-4">
              <legend className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Images (Optional)
              </legend>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-lg p-6 text-center cursor-pointer transition-colors"
              >
                <p className="text-sm text-slate-500 font-medium">Click to upload images</p>
                <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP – max 10 MB each</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImages}
                className="hidden"
              />

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-24 object-cover rounded border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      <p className="text-xs text-slate-400 truncate mt-1">{img.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </fieldset>

            {/* Honeypot – hidden from real users, catches bots */}
            <div aria-hidden="true" style={{ display: 'none' }}>
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                value={form.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                'Submit Complaint'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
