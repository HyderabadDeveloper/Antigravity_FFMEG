import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Antigravity AI Video Creation Platform',
  description:
    'Creative Planning & Continuity Engine: Structured scene breakdown, persistent character sheets, and keyframe visual anchoring for AI video generation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090D16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
