'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project, Scene, Take, GenerationJob } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Film,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Layers,
  Cpu,
  ChevronRight,
  Maximize2,
  Sliders,
  Check,
  Video,
} from 'lucide-react';

interface ClipReviewTabProps {
  project: Project;
  onRefreshProject: () => Promise<void>;
}

export const ClipReviewTab: React.FC<ClipReviewTabProps> = ({
  project,
  onRefreshProject,
}) => {
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<'runway' | 'veo'>('runway');
  const [selectedSceneId, setSelectedSceneId] = useState<string>(
    project.scenes[0]?.id || ''
  );
  const [selectedTakeId, setSelectedTakeId] = useState<string>('');
  const [videoMode, setVideoMode] = useState<'normalized' | 'raw'>('normalized');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDispatchingBatch, setIsDispatchingBatch] = useState(false);
  const [dispatchingSceneId, setDispatchingSceneId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Poll for jobs periodically
  const fetchJobs = async () => {
    try {
      const res = await fetch(`/api/queue/jobs?projectId=${project.id}`);
      const data = await res.json();
      if (data.success && data.jobs) {
        setJobs(data.jobs);

        // If any job recently completed or changed, refresh project
        const hasActive = data.jobs.some(
          (j: GenerationJob) =>
            j.status === 'queued' ||
            j.status === 'generating' ||
            j.status === 'ingesting' ||
            j.status === 'normalizing'
        );
        if (hasActive) {
          onRefreshProject();
        }
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 2000);
    return () => clearInterval(interval);
  }, [project.id]);

  // Selected scene
  const activeScene = project.scenes.find((s) => s.id === selectedSceneId) || project.scenes[0];
  const takes = activeScene?.takes || [];
  const activeTake =
    takes.find((t) => t.id === selectedTakeId) ||
    takes.find((t) => t.id === activeScene?.activeTakeId) ||
    takes[takes.length - 1];

  // Dispatch single scene
  const handleDispatchScene = async (sceneId: string) => {
    try {
      setDispatchingSceneId(sceneId);
      const res = await fetch('/api/queue/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          sceneId,
          providerId: selectedProvider,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchJobs();
      }
    } finally {
      setDispatchingSceneId(null);
    }
  };

  // Dispatch all scenes (batch)
  const handleDispatchAll = async () => {
    try {
      setIsDispatchingBatch(true);
      const res = await fetch('/api/queue/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          providerId: selectedProvider,
          batch: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchJobs();
      }
    } finally {
      setIsDispatchingBatch(false);
    }
  };

  // Cancel job
  const handleCancelJob = async (jobId: string) => {
    try {
      await fetch(`/api/queue/jobs/${jobId}`, { method: 'DELETE' });
      await fetchJobs();
    } catch (err) {
      console.error('Failed to cancel job:', err);
    }
  };

  // Mark take as active for the scene
  const handleSetActiveTake = async (takeId: string) => {
    if (!activeScene) return;
    const updatedScenes = project.scenes.map((s) =>
      s.id === activeScene.id ? { ...s, activeTakeId: takeId } : s
    );

    await fetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenes: updatedScenes }),
    });

    await onRefreshProject();
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const currentVideoSrc =
    videoMode === 'normalized'
      ? activeTake?.normalizedVideoUrl
      : activeTake?.rawVideoUrl;

  const activeJobs = jobs.filter(
    (j) =>
      j.status === 'queued' ||
      j.status === 'generating' ||
      j.status === 'ingesting' ||
      j.status === 'normalizing'
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan">Stage 7 & 8</Badge>
            <h2 className="text-xl font-bold text-white">Clip Generation & FFmpeg Normalization</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Dispatch scene jobs through the provider adapter, ingest raw takes, and inspect deterministic 30fps normalization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Provider selector */}
          <div className="flex items-center bg-[#0B0F19] border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setSelectedProvider('runway')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedProvider === 'runway'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Runway Gen-3
            </button>
            <button
              onClick={() => setSelectedProvider('veo')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedProvider === 'veo'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Google Veo
            </button>
          </div>

          <Button
            variant="neon"
            size="sm"
            onClick={handleDispatchAll}
            isLoading={isDispatchingBatch}
            leftIcon={<Sparkles className="w-4 h-4 text-cyan-400" />}
          >
            Dispatch All Scenes
          </Button>
        </div>
      </div>

      {/* Active Worker Jobs Queue Bar */}
      {activeJobs.length > 0 && (
        <div className="bg-[#111827] border border-indigo-900/60 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h3 className="text-sm font-bold text-white">
                Background Queue & Worker Active ({activeJobs.length} In-Flight)
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Worker concurrency: 2 • Auto-ingesting & normalizing
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {activeJobs.map((job) => {
              const scene = project.scenes.find((s) => s.id === job.sceneId);

              return (
                <div
                  key={job.id}
                  className="bg-[#0B0F19] border border-slate-800 rounded-xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">
                      Scene {scene?.order || '?'}: {scene?.title || 'Unknown'} (Take {job.takeNumber})
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={job.status === 'normalizing' ? 'purple' : 'cyan'}
                        size="sm"
                      >
                        {job.status.toUpperCase()}
                      </Badge>
                      <button
                        onClick={() => handleCancelJob(job.id)}
                        className="text-slate-500 hover:text-rose-400 p-0.5 rounded"
                        title="Cancel Job"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-300"
                      style={{ width: `${job.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[240px]">{job.stageDescription}</span>
                    <span className="font-mono text-cyan-300 font-semibold">
                      {job.progressPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Review Workspace: Scenes Sidebar + Video Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Scenes List (Left 4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Film className="w-4 h-4 text-indigo-400" />
              <span>Scene Takes</span>
            </h3>
            <span className="text-xs text-slate-400">{project.scenes.length} Scenes</span>
          </div>

          <div className="space-y-2">
            {project.scenes.map((scene) => {
              const isSelected = scene.id === selectedSceneId;
              const sceneTakes = scene.takes || [];
              const isGenerating = activeJobs.some((j) => j.sceneId === scene.id);

              return (
                <div
                  key={scene.id}
                  onClick={() => {
                    setSelectedSceneId(scene.id);
                    setSelectedTakeId('');
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition text-left flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#151E33] border-indigo-500/80 shadow-md'
                      : 'bg-[#111827] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-300">
                          Scene {scene.order}
                        </span>
                        <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                          {scene.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {scene.visualDescription}
                      </p>
                    </div>

                    {isGenerating ? (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping flex-shrink-0" />
                    ) : sceneTakes.length > 0 ? (
                      <Badge variant="emerald" size="sm">
                        {sceneTakes.length} Take{sceneTakes.length > 1 ? 's' : ''}
                      </Badge>
                    ) : (
                      <Badge variant="default" size="sm">
                        No Takes
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      {scene.durationSeconds}s • {scene.cameraMovement}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDispatchScene(scene.id);
                      }}
                      disabled={isGenerating || dispatchingSceneId === scene.id}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>{sceneTakes.length > 0 ? '+ New Take' : 'Generate Take'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Player & Take Inspector (Right 8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {activeScene ? (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              {/* Take Selector Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      Scene {activeScene.order}: {activeScene.title}
                    </h3>
                    <Badge variant="indigo" size="sm">
                      {activeScene.cameraMovement}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {activeScene.synthesizedPrompt || activeScene.visualDescription}
                  </p>
                </div>

                {/* Takes Tabs */}
                {takes.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {takes.map((t) => {
                      const isCurrent = activeTake?.id === t.id;
                      const isActiveTimeline = activeScene.activeTakeId === t.id;

                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTakeId(t.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
                            isCurrent
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                              : 'bg-[#0B0F19] text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          <span>Take {t.takeNumber}</span>
                          {isActiveTimeline && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Active Take for Assembly" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Video Player Display */}
              {activeTake ? (
                <div className="space-y-4">
                  {/* Mode Selector (Normalized vs Raw) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-[#0B0F19] border border-slate-800 rounded-xl p-1 text-xs">
                      <button
                        onClick={() => setVideoMode('normalized')}
                        className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                          videoMode === 'normalized'
                            ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Normalized Take (30fps / 48kHz)</span>
                      </button>
                      <button
                        onClick={() => setVideoMode('raw')}
                        className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                          videoMode === 'raw'
                            ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5 text-slate-400" />
                        <span>Raw AI Output</span>
                      </button>
                    </div>

                    {activeScene.activeTakeId !== activeTake.id ? (
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => handleSetActiveTake(activeTake.id)}
                        leftIcon={<Check className="w-3.5 h-3.5 text-emerald-400" />}
                      >
                        Set as Active Take
                      </Button>
                    ) : (
                      <Badge variant="emerald" size="sm" className="flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Active Timeline Take</span>
                      </Badge>
                    )}
                  </div>

                  {/* HTML5 Video Player */}
                  <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video flex items-center justify-center group shadow-2xl">
                    <video
                      ref={videoRef}
                      key={currentVideoSrc}
                      src={currentVideoSrc}
                      loop
                      playsInline
                      className="w-full h-full object-contain"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onClick={togglePlay}
                    />

                    {/* Centered Play/Pause Overlay Button */}
                    <button
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-14 h-14 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform">
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                      </div>
                    </button>
                  </div>

                  {/* Normalization Quality Inspection Badges */}
                  <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>FFmpeg Normalization Compliance Record</span>
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        Codec: {activeTake.codec.toUpperCase()} • Take #{activeTake.takeNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#111827] border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          Frame Rate
                        </span>
                        <div className="font-bold text-emerald-400 text-sm mt-0.5">
                          {activeTake.fps}.00 FPS
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#111827] border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          Color Space
                        </span>
                        <div className="font-bold text-emerald-400 text-sm mt-0.5">
                          {activeTake.pixelFormat} (1:1 SAR)
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#111827] border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          Audio Sampling
                        </span>
                        <div className="font-bold text-emerald-400 text-sm mt-0.5">
                          {activeTake.audioSampleRate / 1000} kHz AAC
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#111827] border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          Streaming Flag
                        </span>
                        <div className="font-bold text-emerald-400 text-sm mt-0.5">
                          +faststart
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prompt Review */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                    <span className="text-slate-400 font-semibold">Conditioning Prompt:</span>
                    <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                      {activeTake.prompt}
                    </p>
                  </div>
                </div>
              ) : (
                /* No Takes Yet */
                <div className="p-12 text-center bg-[#0B0F19] rounded-xl border border-dashed border-slate-800 space-y-3">
                  <Video className="w-12 h-12 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-semibold text-white">
                    No takes generated for Scene {activeScene.order} yet
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Click below to dispatch this scene take through the background worker and run automated FFmpeg normalization.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDispatchScene(activeScene.id)}
                    isLoading={dispatchingSceneId === activeScene.id}
                    leftIcon={<Sparkles className="w-4 h-4 text-cyan-400" />}
                  >
                    Generate Take 1
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">No scene selected</div>
          )}
        </div>
      </div>
    </div>
  );
};
