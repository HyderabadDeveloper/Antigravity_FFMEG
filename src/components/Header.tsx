'use client';

import React from 'react';
import Link from 'next/link';
import { Clapperboard, Sparkles, Layers, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center">
              <Clapperboard className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                Antigravity Video
              </span>
              <Badge variant="cyan" size="sm">Phase 3</Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Multi-Track Audio & FFmpeg Timeline Assembly
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Multi-Track Assembly Ready</span>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Projects</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
