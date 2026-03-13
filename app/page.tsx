import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚨</span>
          <span className="text-xl font-bold tracking-tight">CrimeReport</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/complaint" className="hover:text-blue-300 transition-colors">
            File Complaint
          </Link>
          <Link href="/track" className="hover:text-blue-300 transition-colors">
            Track Complaint
          </Link>
          <Link href="/map" className="hover:text-blue-300 transition-colors">
            Live Map
          </Link>
          <Link
            href="/admin/login"
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">🚔</div>
            <h1 className="text-5xl font-extrabold mb-6 leading-tight">
              Report Crime.
              <br />
              <span className="text-blue-400">Stay Safe.</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              A secure, fast, and transparent platform for citizens to submit crime
              complaints and track their resolution in real time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/complaint"
                className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg transition-all hover:scale-105"
              >
                📋 Register Complaint
              </Link>
              <Link
                href="/map"
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg transition-all hover:scale-105"
              >
                🗺️ View Live Map
              </Link>
              <Link
                href="/track"
                className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg transition-all hover:scale-105"
              >
                🔍 Track Complaint
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: '📝',
                  title: '1. Submit Your Complaint',
                  desc: 'Fill out a simple form with your details, select the crime type, describe the incident, and optionally attach photos and your GPS location.',
                },
                {
                  icon: '📱',
                  title: '2. Get Instant Confirmation',
                  desc: 'Receive an SMS with your unique Complaint ID immediately after submission. Use it any time to check your case status.',
                },
                {
                  icon: '✅',
                  title: '3. Track Resolution',
                  desc: 'Monitor your complaint\'s progress from Pending to In Progress to Resolved. Admins update the status as they act on your report.',
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="bg-slate-50 rounded-2xl p-8 border border-slate-200 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="py-16 px-6 bg-slate-50">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { value: '🔒', label: 'Secure & Private', sub: 'All data encrypted via Supabase' },
              { value: '📍', label: 'GPS-Enabled', sub: 'Precise crime location mapping' },
              { value: '⚡', label: 'Real-Time Updates', sub: 'Live map and instant SMS alerts' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="text-3xl mb-2">{s.value}</div>
                <div className="text-lg font-bold text-slate-800">{s.label}</div>
                <div className="text-sm text-slate-500 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Issue types */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-8">Types of Complaints Accepted</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {['Robbery', 'Murder', 'Assault', 'Theft', 'Harassment', 'Missing Person', 'Other'].map((t) => (
                <span
                  key={t}
                  className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium border border-slate-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-6 text-center text-sm">
        <p>© {new Date().getFullYear()} CrimeReport Platform. All rights reserved.</p>
        <p className="mt-1">For emergencies, always call your local emergency number (e.g., 911).</p>
      </footer>
    </div>
  );
}
