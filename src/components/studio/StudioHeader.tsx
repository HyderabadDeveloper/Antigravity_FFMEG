'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ChevronLeft,
  Sparkles,
  Layers,
  MessageSquare,
  Users,
  Film,
  Image as ImageIcon,
  Share2,
  Clock,
  CheckCircle2,
  Video,
} from 'lucide-react';
import { formatDuration } from '@/lib/utils';

export type StudioTab =
  | 'concept'
  | 'brainstorm'
  | 'continuity'
  | 'storyboard'
  | 'keyframes'
  | 'review'
  | 'export';

interface StudioHeaderProps {
  project: Project;
  activeTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
  onSynthesizePrompts: () => Promise<void>;
  isSynthesizing: boolean;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  project,
  activeTab,
  onTabChange,
  onSynthesizePrompts,
  isSynthesizing,
}) => {
  const totalRuntime = project.scenes.reduce((sum, s) => sum + (s.durationSeconds || 5), 0);
  const promptReadyCount = project.scenes.filter((s) => !!s.synthesizedPrompt).length;
  const keyframesReadyCount = project.scenes.filter((s) => s.keyframeStatus === 'ready').length;
  const scenesWithTakesCount = project.scenes.filter((s) => (s.takes?.length || 0) > 0).length;

  const tabs: { id: StudioTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'concept', label: '1. Concept Brief', icon: <Layers className="w-4 h-4" /> },
    {
      id: 'brainstorm',
      label: '2. AI Director Chat',
      icon: <MessageSquare className="w-4 h-4" />,
      badge: `${project.brainstormMessages.length}`,
    },
    {
      id: 'continuity',
      label: '3. Continuity & Characters',
      icon: <Users className="w-4 h-4" />,
      badge: `${project.characters.length}`,
    },
    {
      id: 'storyboard',
      label: '4. Scene Storyboard',
      icon: <Film className="w-4 h-4" />,
      badge: `${project.scenes.length}`,
    },
    {
      id: 'keyframes',
      label: '5. Keyframe Studio (I2V)',
      icon: <ImageIcon className="w-4 h-4" />,
      badge: `${keyframesReadyCount}/${project.scenes.length}`,
    },
    {
      id: 'review',
      label: '6. Clip Review (FFmpeg)',
      icon: <Video className="w-4 h-4" />,
      badge: `${scenesWithTakesCount}/${project.scenes.length}`,
    },
    { id: 'export', label: '7. Provider Export', icon: <Share2 className="w-4 h-4" /> },
  ];

  return (
    <div className="border-b border-slate-800 bg-[#0B0F19]/95 backdrop-blur-md sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Top bar with back, title, runtime and synthesize button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Back to Projects"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-white tracking-tight line-clamp-1">
                  {project.title}
                </h1>
                <Badge variant="cyan" size="sm">
                  {project.aspectRatio}
                </Badge>
                <Badge variant="indigo" size="sm">
                  {project.visualGenre}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>
                    Runtime: {formatDuration(totalRuntime)} / {project.targetDurationSeconds}s target
                  </span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>
                    {promptReadyCount}/{project.scenes.length} Prompts Synthesized
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <Button
              variant="neon"
              size="sm"
              onClick={onSynthesizePrompts}
              isLoading={isSynthesizing}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
              title="Automatically compiles character tokens, camera choreography, and lighting rules into model-ready prompts"
            >
              Synthesize Model Prompts
            </Button>
          </div>
        </div>

        {/* Studio Navigation Stepper Tabs */}
        <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                        : 'bg-slate-800/80 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
