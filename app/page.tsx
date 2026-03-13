import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-900 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900 tracking-tight uppercase">CrimeReport</span>
          </div>
          <div className="hidden sm:flex items-center gap-0">
            <Link href="/complaint" className="text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 uppercase tracking-wide transition-all">
              File Complaint
            </Link>
            <Link href="/track" className="text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 uppercase tracking-wide transition-all">
              Track
            </Link>
            <Link href="/map" className="text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 uppercase tracking-wide transition-all">
              Live Map
            </Link>
            <Link href="/analytics" className="text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 uppercase tracking-wide transition-all">
              Analytics
            </Link>
            <div className="w-px h-4 bg-gray-200 mx-2" />
            <Link
              href="/admin/login"
              className="text-xs text-gray-700 border border-gray-300 hover:border-gray-900 hover:bg-gray-900 hover:text-white px-3 py-1.5 uppercase tracking-wide font-medium transition-all rounded-sm"
            >
              Admin
            </Link>
          </div>
          <div className="flex sm:hidden items-center">
            <Link href="/complaint" className="text-xs bg-gray-900 text-white px-4 py-2 uppercase tracking-wide font-medium rounded-sm">
              Report
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gray-900 text-white">
          <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
            <div className="max-w-2xl">
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-6">Platform Active · Real-time Monitoring</p>
              <h1 className="text-5xl sm:text-6xl font-light mb-6 leading-[1.05] tracking-tight text-white">
                Report Crime.<br />
                <span className="font-bold">Stay Safe.</span>
              </h1>
              <p className="text-base text-gray-400 mb-10 leading-relaxed max-w-xl font-light">
                A secure, transparent platform for citizens to submit crime complaints
                and track their resolution in real time.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/complaint"
                  className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Register Complaint
                </Link>
                <Link
                  href="/track"
                  className="inline-flex items-center justify-center gap-2 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-6 py-3 rounded-sm text-xs font-semibold uppercase tracking-widest transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  Track Complaint
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-3 divide-x divide-gray-200">
            {[
              { value: '24/7', label: 'Platform Uptime' },
              { value: 'GPS', label: 'Location Precision' },
              { value: 'SMS', label: 'Instant Alerts' },
            ].map((s) => (
              <div key={s.label} className="px-6 first:pl-0 last:pr-0 text-center">
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 bg-[#F7F7F5]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 border-b border-gray-200 pb-6">
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">Simple Process</p>
              <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-200">
              {[
                {
                  step: '01',
                  title: 'Submit Your Complaint',
                  desc: 'Fill out a simple form with your details, select the crime type, describe the incident, and optionally attach photos and your GPS location.',
                  accent: 'border-t-4 border-t-gray-900',
                },
                {
                  step: '02',
                  title: 'Get Instant Confirmation',
                  desc: 'Receive an SMS with your unique Complaint ID immediately after submission. Use it any time to check your case status.',
                  accent: 'border-t-4 border-t-blue-700',
                },
                {
                  step: '03',
                  title: 'Track Resolution',
                  desc: "Monitor your complaint's progress from Pending to In Progress to Resolved. Admins update the status as they act on your report.",
                  accent: 'border-t-4 border-t-green-700',
                },
              ].map((f, i) => (
                <div
                  key={f.step}
                  className={`bg-white p-8 border-gray-200 ${i > 0 ? 'border-l' : ''} ${f.accent}`}
                >
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{f.step}</span>
                  <h3 className="text-base font-bold text-gray-900 mt-3 mb-3">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust section */}
        <section className="py-20 px-6 bg-white border-t border-gray-200">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 border-b border-gray-200 pb-6">
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">Why Choose Us</p>
              <h2 className="text-2xl font-bold text-gray-900">Built for Trust &amp; Transparency</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-gray-200">
              {[
                {
                  label: 'Secure & Private',
                  sub: 'End-to-end encrypted storage via Supabase with strict access controls.',
                  accent: 'border-t-4 border-t-gray-900',
                },
                {
                  label: 'GPS-Enabled',
                  sub: 'Precise GPS coordinates for accurate incident mapping and faster response.',
                  accent: 'border-t-4 border-t-blue-700',
                },
                {
                  label: 'Real-Time Updates',
                  sub: 'Live map refresh and instant SMS alerts keep you informed every step of the way.',
                  accent: 'border-t-4 border-t-green-700',
                },
              ].map((s, i) => (
                <div key={s.label} className={`p-8 border-gray-200 ${i > 0 ? 'border-l' : ''} ${s.accent}`}>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{s.label}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-[#F7F7F5] border-t border-gray-200">
          <div className="max-w-3xl mx-auto">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-3">Take Action</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to file a report?</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-md">
              It takes less than 3 minutes. Your report helps keep your community safe.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/complaint"
                className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-all"
              >
                File a Complaint Now
              </Link>
              <Link
                href="/track"
                className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900 px-6 py-3 rounded-sm text-xs font-semibold uppercase tracking-widest transition-all"
              >
                Track Existing Report
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 text-gray-400 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-900 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">CrimeReport</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/map" className="text-xs uppercase tracking-wide hover:text-gray-700 transition-colors">Live Map</Link>
            <Link href="/analytics" className="text-xs uppercase tracking-wide hover:text-gray-700 transition-colors">Analytics</Link>
            <Link href="/admin/login" className="text-xs uppercase tracking-wide hover:text-gray-700 transition-colors">Admin</Link>
          </div>
          <div className="text-right">
            <p className="text-xs">© {new Date().getFullYear()} CrimeReport. All rights reserved.</p>
            <p className="text-[10px] text-gray-400 mt-1">For emergencies, always call your local emergency number (e.g., 911).</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
