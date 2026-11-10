'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project, ProviderBenchmark, Scene, Take } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Cpu,
  DollarSign,
  Clock,
  Sparkles,
  Scissors,
  CheckCircle2,
  Check,
  Play,
  Pause,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Video,
  Layers,
} from 'lucide-react';
import { recommendProviderForScene } from '@/lib/providers/benchmarks';

interface ProviderBenchmarkTabProps {
  project: Project;
  onRefreshProject: () => Promise<void>;
}

export const ProviderBenchmarkTab: React.FC<ProviderBenchmarkTabProps> = ({
  project,
  onRefreshProject,
}) => {
  const [benchmarks, setBenchmarks] = useState<ProviderBenchmark[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string>(project.scenes[0]?.id || '');
  const [selectedTakeId, setSelectedTakeId] = useState<string>('');
  const [inPoint, setInPoint] = useState<number>(0);
  const [outPoint, setOutPoint] = useState<number>(5);
  const [isTrimming, setIsTrimming] = useState<boolean>(false);

  // Compare mode
  const [compareTakeAId, setCompareTakeAId] = useState<string>('');
  const [compareTakeBId, setCompareTakeBId] = useState<string>('');

  useEffect(() => {
    fetch('/api/providers/benchmarks')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.benchmarks) setBenchmarks(data.benchmarks);
      })
      .catch((err) => console.error(err));
  }, []);

  const activeScene = project.scenes.find((s) => s.id === selectedSceneId) || project.scenes[0];
  const takes = activeScene?.takes || [];
  const activeTake =
    takes.find((t) => t.id === selectedTakeId) ||
    takes.find((t) => t.id === activeScene?.activeTakeId) ||
    takes[0];

  useEffect(() => {
    if (activeTake) {
      setInPoint(activeTake.trimming?.inPointSeconds || 0);
      setOutPoint(activeTake.trimming?.outPointSeconds || activeTake.durationSeconds);
    }
  }, [activeTake?.id]);

  const totalRuntime = project.scenes.reduce((sum, s) => sum + (s.durationSeconds || 5), 0);

  // Cost estimates for the project
  const avgCostPerSec = benchmarks.length > 0 ? benchmarks[0].costPerSecond : 0.05;
  const estimatedCost = (totalRuntime * avgCostPerSec).toFixed(2);
  const estimatedLatencyMins = Math.round((totalRuntime * 5) / 60);

  const handleTrimTake = async () => {
    if (!activeTake || !activeScene) return;
    try {
      setIsTrimming(true);
      const res = await fetch('/api/takes/trim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          sceneId: activeScene.id,
          takeId: activeTake.id,
          inPointSeconds: inPoint,
          outPointSeconds: outPoint,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await onRefreshProject();
      }
    } finally {
      setIsTrimming(false);
    }
  };

  const takeA = takes.find((t) => t.id === compareTakeAId) || takes[0];
  const takeB = takes.find((t) => t.id === compareTakeBId) || takes[1] || takes[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan">Phase 4</Badge>
            <h2 className="text-xl font-bold text-white">Multi-Provider Benchmarking & Advanced Controls</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Compare model performance, latency, and cost across Runway Gen-3, Google Veo, Luma, Kling, and Azure. Fine-tune cut-points with precision trimming.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#0B0F19] border border-slate-800 rounded-2xl px-4 py-2.5">
          <div className="text-right">
            <div className="text-[10px] uppercase font-semibold text-slate-500">Project Cost Est.</div>
            <div className="text-base font-extrabold text-emerald-400 font-mono">${estimatedCost}</div>
          </div>
          <div className="w-[1px] h-8 bg-slate-800" />
          <div className="text-right">
            <div className="text-[10px] uppercase font-semibold text-slate-500">Turnaround Est.</div>
            <div className="text-base font-extrabold text-cyan-400 font-mono">~{estimatedLatencyMins || 1} min</div>
          </div>
        </div>
      </div>

      {/* Provider Benchmark Comparison Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">
            Provider Model Comparison Matrix ({benchmarks.length} Integrated Adapters)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benchmarks.map((bm) => (
            <div
              key={bm.id}
              className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{bm.name}</h4>
                  <Badge variant="indigo" size="sm">
                    {bm.company}
                  </Badge>
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                  <span className="text-slate-300 font-semibold">Best for: </span>
                  {bm.bestFor}
                </p>

                {/* Score Indicators */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800">
                  <div className="p-2 rounded-lg bg-[#0B0F19] border border-slate-800/80">
                    <span className="text-[9px] uppercase font-semibold text-slate-500">
                      Visual Quality
                    </span>
                    <div className="font-bold text-emerald-400 text-sm mt-0.5">
                      {bm.qualityScore} / 10
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#0B0F19] border border-slate-800/80">
                    <span className="text-[9px] uppercase font-semibold text-slate-500">
                      Consistency
                    </span>
                    <div className="font-bold text-cyan-400 text-sm mt-0.5">
                      {bm.consistencyScore} / 10
                    </div>
                  </div>
                </div>

                {/* Specs */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                    <span>${bm.costPerSecond.toFixed(2)} / sec</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>~{bm.avgTurnaroundSeconds}s latency</span>
                  </span>
                </div>
              </div>

              {/* Strengths */}
              <div className="space-y-1 pt-3 border-t border-slate-800">
                <span className="text-[10px] font-semibold uppercase text-slate-500">Key Strengths:</span>
                <div className="flex flex-wrap gap-1">
                  {bm.strengths.map((str, i) => (
                    <span
                      key={i}
                      className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300"
                    >
                      {str}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Model Recommendation per Scene */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              AI Smart Provider Routing & Recommendations
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Analyzes character presence, camera velocity, and prompt complexity
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {project.scenes.map((scene) => {
            const hasChar = scene.characterIds.length > 0;
            const rec = recommendProviderForScene(
              scene.synthesizedPrompt || scene.visualDescription,
              hasChar
            );
            const providerName = benchmarks.find((b) => b.id === rec.recommendedId)?.name || rec.recommendedId;

            return (
              <div
                key={scene.id}
                className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">
                    Scene {scene.order}: {scene.title}
                  </span>
                  <Badge variant="cyan" size="sm">
                    {providerName}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {rec.reason}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advanced Precision Cut-Point Trimming Studio */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              Take Micro-Trimming & Artifact Removal
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Trim leading or trailing frames to eliminate generation anomalies
          </span>
        </div>

        {activeTake ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Video Player */}
            <div className="lg:col-span-6 rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video relative shadow-lg">
              <video
                key={activeTake.normalizedVideoUrl}
                src={activeTake.normalizedVideoUrl}
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Trimming Controls */}
            <div className="lg:col-span-6 space-y-5">
              <div>
                <h4 className="font-bold text-white text-sm">
                  Scene {activeScene.order} (Take #{activeTake.takeNumber})
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {activeTake.prompt}
                </p>
              </div>

              {/* In/Out Sliders */}
              <div className="space-y-4 p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                    <span>In-Point (Start Trim)</span>
                    <span className="font-mono text-cyan-400 font-bold">{inPoint.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(1, outPoint - 0.5)}
                    step="0.1"
                    value={inPoint}
                    onChange={(e) => setInPoint(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                    <span>Out-Point (End Trim)</span>
                    <span className="font-mono text-emerald-400 font-bold">{outPoint.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min={inPoint + 0.5}
                    max={activeTake.durationSeconds || 5}
                    step="0.1"
                    value={outPoint}
                    onChange={(e) => setOutPoint(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
                  <span className="text-slate-400">
                    Resulting Duration: <strong className="text-white">{(outPoint - inPoint).toFixed(1)}s</strong>
                  </span>

                  <Button
                    variant="neon"
                    size="sm"
                    onClick={handleTrimTake}
                    isLoading={isTrimming}
                    leftIcon={<Scissors className="w-3.5 h-3.5" />}
                  >
                    Apply Precision Trim
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs">
            Generate takes in Stage 6 to enable precision trimming.
          </div>
        )}
      </div>

      {/* Side-by-Side Take Comparison */}
      {takes.length >= 2 && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">
                Side-by-Side Take Version Comparison (Scene {activeScene.order})
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Evaluate visual continuity and motion quality between takes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Take A */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Compare Take A:</span>
                <select
                  value={compareTakeAId || takes[0].id}
                  onChange={(e) => setCompareTakeAId(e.target.value)}
                  className="px-2 py-1 rounded bg-[#0B0F19] border border-slate-800 text-xs text-white"
                >
                  {takes.map((t) => (
                    <option key={t.id} value={t.id}>
                      Take #{t.takeNumber} ({t.providerId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl overflow-hidden bg-black border border-slate-800 aspect-video">
                <video
                  src={takeA?.normalizedVideoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Take B */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Compare Take B:</span>
                <select
                  value={compareTakeBId || takes[1]?.id || takes[0].id}
                  onChange={(e) => setCompareTakeBId(e.target.value)}
                  className="px-2 py-1 rounded bg-[#0B0F19] border border-slate-800 text-xs text-white"
                >
                  {takes.map((t) => (
                    <option key={t.id} value={t.id}>
                      Take #{t.takeNumber} ({t.providerId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl overflow-hidden bg-black border border-slate-800 aspect-video">
                <video
                  src={takeB?.normalizedVideoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
