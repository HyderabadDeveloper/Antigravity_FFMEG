'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Film, Users, Clock, ArrowRight, Trash2 } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  // Find thumbnail: first scene keyframe or first character keyframe or sleek placeholder
  const thumbnail =
    project.scenes.find((s) => s.keyframeUrl)?.keyframeUrl ||
    project.characters.find((c) => c.referenceKeyframeUrl)?.referenceKeyframeUrl ||
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80';

  const totalRuntime = project.scenes.reduce((sum, s) => sum + (s.durationSeconds || 5), 0);

  return (
    <div className="group relative bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-300 flex flex-col">
      {/* Thumbnail Banner */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={thumbnail}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <Badge variant="cyan" size="sm">
            {project.aspectRatio}
          </Badge>
          <Badge variant="indigo" size="sm">
            {project.visualGenre}
          </Badge>
        </div>

        {/* Duration pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] text-slate-200 border border-white/10">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>{formatDuration(totalRuntime || project.targetDurationSeconds)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
            {project.title}
          </h3>
          <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {project.concept || project.creativeBrief.logline || 'No description provided.'}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          {/* Metadata counters */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Film className="w-3.5 h-3.5 text-indigo-400" />
              <span>{project.scenes.length} Scenes</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{project.characters.length} Characters</span>
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
                  onDelete(project.id);
                }
              }}
              title="Delete Project"
              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <Link
              href={`/projects/${project.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 group/btn transition"
            >
              <span>Open Studio</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
