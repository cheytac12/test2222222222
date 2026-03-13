import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight">CrimeReport</span>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/complaint" className="text-slate-300 hover:text-white transition-colors">
            File Complaint
          </Link>
          <Link href="/track" className="text-slate-300 hover:text-white transition-colors">
            Track Complaint
          </Link>
          <Link href="/map" className="text-slate-300 hover:text-white transition-colors">
            Live Map
          </Link>
          <Link
            href="/admin/login"
            className="border border-slate-600 hover:border-slate-400 hover:text-white text-slate-300 px-4 py-1.5 rounded font-medium transition-colors text-xs"
          >
            Admin
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="bg-slate-900 text-white py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">
              Secure · Transparent · Real-time
            </p>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Report Crime.
              <br />
              <span className="text-blue-400">Stay Safe.</span>
            </h1>
            <p className="text-lg text-slate-400 mb-10 max-w-xl leading-relaxed">
              A secure platform for citizens to submit crime complaints and track
              their resolution in real time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/complaint"
                className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-3 rounded text-sm font-semibold transition-colors"
              >
                Register Complaint
              </Link>
              <Link
                href="/track"
                className="bg-transparent border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-7 py-3 rounded text-sm font-semibold transition-colors"
              >
                Track Complaint
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-10">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  title: 'Submit Your Complaint',
                  desc: 'Fill out a simple form with your details, select the crime type, describe the incident, and optionally attach photos and your GPS location.',
                },
                {
                  step: '02',
                  title: 'Get Instant Confirmation',
                  desc: 'Receive an SMS with your unique Complaint ID immediately after submission. Use it any time to check your case status.',
                },
                {
                  step: '03',
                  title: 'Track Resolution',
                  desc: "Monitor your complaint's progress from Pending to In Progress to Resolved. Admins update the status as they act on your report.",
                },
              ].map((f) => (
                <div
                  key={f.step}
                  className="border border-slate-200 rounded-lg p-6 hover:shadow-sm transition-shadow"
                >
                  <p className="text-xs font-bold text-blue-500 tracking-widest mb-3">{f.step}</p>
                  <h3 className="text-base font-semibold text-slate-800 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="py-14 px-6 bg-slate-50 border-y border-slate-200">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { label: 'Secure & Private', sub: 'All data encrypted via Supabase' },
              { label: 'GPS-Enabled', sub: 'Precise crime location mapping' },
              { label: 'Real-Time Updates', sub: 'Live map and instant SMS alerts' },
            ].map((s) => (
              <div key={s.label} className="py-2">
                <div className="text-sm font-semibold text-slate-800">{s.label}</div>
                <div className="text-xs text-slate-400 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Issue types */}
        <section className="py-14 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">
              Accepted Complaint Types
            </h2>
            <div className="flex flex-wrap gap-2">
              {['Robbery', 'Murder', 'Assault', 'Theft', 'Harassment', 'Missing Person', 'Other'].map((t) => (
                <span
                  key={t}
                  className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded text-xs font-medium border border-slate-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-6 px-6 text-center text-xs">
        <p>© {new Date().getFullYear()} CrimeReport Platform. All rights reserved.</p>
        <p className="mt-1">For emergencies, always call your local emergency number (e.g., 911).</p>
      </footer>
    </div>
  );
}
