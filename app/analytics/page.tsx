import Link from 'next/link';
import AnalyticsContent from '@/components/AnalyticsContent';

export default function PublicAnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <header className="bg-white border-b border-gray-200 px-6 py-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-900 transition-colors text-xs flex items-center gap-1.5 uppercase tracking-wide">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">Analytics</span>
          </div>
          <Link
            href="/map"
            className="text-xs border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white text-gray-600 px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 uppercase tracking-wide"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
            View Map
          </Link>
        </div>
      </header>

      <AnalyticsContent />
    </div>
  );
}
