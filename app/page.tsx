import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286z" />
              </svg>
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">CrimeReport</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <Link href="/complaint" className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg transition-all">
              File Complaint
            </Link>
            <Link href="/track" className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg transition-all">
              Track Complaint
            </Link>
            <Link href="/map" className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg transition-all">
              Live Map
            </Link>
            <Link href="/analytics" className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg transition-all">
              Analytics
            </Link>
            <div className="w-px h-5 bg-slate-200 mx-1" />
            <Link
              href="/admin/login"
              className="text-sm text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-all"
            >
              Admin
            </Link>
          </div>
          {/* Mobile menu button (simplified) */}
          <div className="flex sm:hidden items-center gap-2">
            <Link href="/complaint" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Report
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-slate-950 text-white">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }} />
          {/* Gradient orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />

          <div className="relative max-w-6xl mx-auto px-6 py-28 md:py-36">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-blue-300 tracking-wide">Platform Active · Real-time Monitoring</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight">
                Report Crime.
                <br />
                <span className="text-blue-400">Stay Safe.</span>
              </h1>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-xl">
                A secure, transparent platform for citizens to submit crime complaints
                and track their resolution in real time.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/complaint"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-7 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/30"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Register Complaint
                </Link>
                <Link
                  href="/track"
                  className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white px-7 py-3.5 rounded-xl text-sm font-semibold transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  Track Complaint
                </Link>
              </div>
            </div>
          </div>
          {/* Bottom fade */}
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
        </section>

        {/* Stats bar */}
        <section className="bg-white border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-3 gap-6 text-center">
            {[
              { value: '24/7', label: 'Platform Uptime' },
              { value: 'GPS', label: 'Location Precision' },
              { value: 'SMS', label: 'Instant Alerts' },
            ].map((s) => (
              <div key={s.label} className="space-y-1">
                <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="mb-14">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Simple Process</p>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
              <p className="text-slate-500 text-base max-w-xl">
                Filing a complaint takes less than 3 minutes. Follow these simple steps to get started.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  title: 'Submit Your Complaint',
                  desc: 'Fill out a simple form with your details, select the crime type, describe the incident, and optionally attach photos and your GPS location.',
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                    </svg>
                  ),
                },
                {
                  step: '02',
                  title: 'Get Instant Confirmation',
                  desc: 'Receive an SMS with your unique Complaint ID immediately after submission. Use it any time to check your case status.',
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                  ),
                },
                {
                  step: '03',
                  title: 'Track Resolution',
                  desc: "Monitor your complaint's progress from Pending to In Progress to Resolved. Admins update the status as they act on your report.",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  ),
                },
              ].map((f) => (
                <div
                  key={f.step}
                  className="group relative bg-white rounded-2xl border border-slate-200 p-7 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {f.icon}
                    </div>
                    <span className="text-2xl font-black text-slate-100 group-hover:text-blue-100 transition-colors">{f.step}</span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust section */}
        <section className="py-20 px-6 bg-slate-950">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">Why Choose Us</p>
              <h2 className="text-3xl font-bold text-white mb-4">Built for Trust & Transparency</h2>
              <p className="text-slate-400 text-base max-w-xl mx-auto">
                Every feature is designed with citizen safety and data privacy at the core.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  ),
                  label: 'Secure & Private',
                  sub: 'End-to-end encrypted storage via Supabase with strict access controls.',
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  ),
                  label: 'GPS-Enabled',
                  sub: 'Precise GPS coordinates for accurate incident mapping and faster response.',
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  ),
                  label: 'Real-Time Updates',
                  sub: 'Live map refresh and instant SMS alerts keep you informed every step of the way.',
                },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] transition-colors">
                  <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
                    {s.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{s.label}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 px-6 bg-blue-600">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to file a report?</h2>
            <p className="text-blue-100 text-base mb-8 max-w-md mx-auto">
              It takes less than 3 minutes. Your report helps keep your community safe.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/complaint"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-8 py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-700/20"
              >
                File a Complaint Now
              </Link>
              <Link
                href="/track"
                className="inline-flex items-center justify-center gap-2 bg-blue-500/40 hover:bg-blue-500/60 border border-blue-300/30 text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition-all"
              >
                Track Existing Report
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600/80 rounded-md flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286z" />
              </svg>
            </div>
            <span className="text-slate-400 font-medium">CrimeReport Platform</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/map" className="hover:text-slate-300 transition-colors">Live Map</Link>
            <Link href="/analytics" className="hover:text-slate-300 transition-colors">Analytics</Link>
            <Link href="/admin/login" className="hover:text-slate-300 transition-colors">Admin</Link>
          </div>
          <div className="text-center sm:text-right space-y-1">
            <p>© {new Date().getFullYear()} CrimeReport. All rights reserved.</p>
            <p className="text-slate-600">For emergencies, always call your local emergency number (e.g., 911).</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
