import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CrimeReport – Crime Complaint Reporting Platform',
  description:
    'A secure platform for citizens to submit and track crime complaints, and for administrators to manage and respond to reports.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
