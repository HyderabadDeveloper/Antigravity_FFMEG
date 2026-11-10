import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border select-none',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};
