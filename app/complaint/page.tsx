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
    email: '',
    phone: '',
    issue_type: '',
    description: '',
    city: '',
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

    if (!form.name.trim() || !form.email.trim() || !form.issue_type || !form.description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!form.latitude || !form.longitude) {
      setError('Current location is required. Please click "Use Current Location" to capture your GPS coordinates.');
      return;
    }

    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('email', form.email.trim());
      fd.append('phone', form.phone.trim());
      fd.append('issue_type', form.issue_type);
      fd.append('description', form.description.trim());
      if (form.city.trim()) fd.append('city', form.city.trim());
      fd.append('latitude', form.latitude);
      fd.append('longitude', form.longitude);
      fd.append('website', form.website);
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
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-6">
        <div className="bg-white border border-gray-200 border-t-4 border-t-green-700 max-w-md w-full p-8">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-4">Submission Confirmed</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Complaint Submitted</h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Your complaint has been registered. An email confirmation has been sent to your email address.
          </p>
          <div className="bg-[#F7F7F5] border border-gray-200 p-5 mb-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">Your Complaint ID</p>
            <p className="text-3xl font-bold font-mono text-gray-900 tracking-wider">{success.complaint_id}</p>
            <p className="text-xs text-gray-400 mt-2">Save this ID to track your complaint status</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push(`/track?id=${success.complaint_id}`)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-sm font-semibold text-xs uppercase tracking-widest transition-colors"
            >
              Track My Complaint
            </button>
            <Link
              href="/"
              className="w-full text-center border border-gray-200 hover:border-gray-400 text-gray-600 px-6 py-3 rounded-sm font-medium text-xs uppercase tracking-widest transition-colors"
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
          <span className="text-xs text-gray-700 font-medium uppercase tracking-wide">Register a Complaint</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-10 px-6">
        <div className="mb-8">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">New Report</p>
          <h1 className="text-2xl font-bold text-gray-900">Crime Complaint Registration</h1>
          <p className="text-sm text-gray-500 mt-1">All fields marked with <span className="text-red-600">*</span> are required.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex gap-3 items-start rounded-sm">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          {/* Personal Info */}
          <div className="bg-white border border-gray-200 border-t-4 border-t-gray-900">
            <div className="px-6 py-3 border-b border-gray-200">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Personal Information</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. John Smith"
                  required
                  className="w-full border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  required
                  aria-required="true"
                  className="w-full border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1.5">An email confirmation will be sent to this address.</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                  Phone Number <span className="text-gray-400 normal-case font-normal">(Optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1 555-123-4567"
                  className="w-full border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Complaint Details */}
          <div className="bg-white border border-gray-200 border-t-4 border-t-blue-700">
            <div className="px-6 py-3 border-b border-gray-200">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Complaint Details</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label htmlFor="issue_type" className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                  Issue Type <span className="text-red-600">*</span>
                </label>
                <select
                  id="issue_type"
                  name="issue_type"
                  value={form.issue_type}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white"
                >
                  <option value="">Select issue type</option>
                  {ISSUE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  required
                  placeholder="Describe the incident in detail – what happened, when, who was involved, etc."
                  className="w-full border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-y placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                  City <span className="text-gray-400 normal-case font-normal">(Optional)</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. New York, Mumbai"
                  className="w-full border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1.5">Helps categorize your complaint by location.</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white border border-gray-200 border-t-4 border-t-green-700">
            <div className="px-6 py-3 border-b border-gray-200">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
                Current Location <span className="text-red-600 normal-case font-normal">(Required)</span>
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gpsLoading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white border border-transparent px-4 py-3 rounded-sm font-medium text-xs uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
              >
                {gpsLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Getting Location…
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    Use Current Location
                  </>
                )}
              </button>

              {gpsError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-4 py-3 flex gap-2.5 items-start">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {gpsError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">Latitude</label>
                  <input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={handleChange}
                    placeholder="e.g. 40.712776"
                    className="w-full border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-[#F7F7F5] placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">Longitude</label>
                  <input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={handleChange}
                    placeholder="e.g. -74.005974"
                    className="w-full border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-[#F7F7F5] placeholder:text-gray-400"
                  />
                </div>
              </div>
              {form.latitude && form.longitude && (
                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-sm px-3.5 py-2.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Location captured: {form.latitude}, {form.longitude}
                </div>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white border border-gray-200 border-t-4 border-t-yellow-600">
            <div className="px-6 py-3 border-b border-gray-200">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Images <span className="normal-case font-normal text-gray-400">(Optional)</span></h2>
            </div>
            <div className="p-6 space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50 p-8 text-center cursor-pointer transition-all"
              >
                <svg className="w-5 h-5 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm text-gray-600 font-medium">Click to upload images</p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP – max 10 MB each</p>
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
                        className="w-full h-24 object-cover border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1.5 right-1.5 bg-red-600 text-white w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-400 truncate mt-1">{img.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Honeypot */}
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
            className="w-full bg-gray-900 hover:bg-gray-800 text-white px-6 py-3.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                Submit Complaint
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
