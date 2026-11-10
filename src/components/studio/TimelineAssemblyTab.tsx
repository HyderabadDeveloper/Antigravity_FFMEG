'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project, Scene, TimelineSettings, MusicTrack } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Film,
  Mic,
  Music,
  Subtitles,
  Sparkles,
  Play,
  Pause,
  Download,
  Share2,
  Sliders,
  Volume2,
  CheckCircle2,
  Check,
  RotateCcw,
  Layers,
  Wand2,
  FileText,
  Clock,
  Video,
} from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface TimelineAssemblyTabProps {
  project: Project;
  onRefreshProject: () => Promise<void>;
}

export const TimelineAssemblyTab: React.FC<TimelineAssemblyTabProps> = ({
  project,
  onRefreshProject,
}) => {
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [settings, setSettings] = useState<TimelineSettings>(
    project.timelineSettings || {
      transitionType: 'cut',
      transitionDurationSeconds: 0.5,
      includeVoiceover: true,
      includeMusic: true,
      selectedMusicId: 'music_cyberpunk_pulse',
      musicVolume: 0.25,
      duckingIntensity: 0.7,
      burnSubtitles: false,
      subtitleStyle: 'cinematic',
    }
  );

  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStage, setRenderStage] = useState('');
  const [generatingTtsSceneId, setGeneratingTtsSceneId] = useState<string | null>(null);

  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const [isMasterPlaying, setIsMasterPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const masterVideoRef = useRef<HTMLVideoElement | null>(null);

  // Fetch music tracks
  useEffect(() => {
    fetch('/api/audio/music')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tracks) setMusicTracks(data.tracks);
      })
      .catch((err) => console.error(err));
  }, []);

  // Generate voiceover for a single scene
  const handleGenerateVoiceover = async (sceneId: string) => {
    try {
      setGeneratingTtsSceneId(sceneId);
      const res = await fetch('/api/audio/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          sceneId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await onRefreshProject();
      }
    } finally {
      setGeneratingTtsSceneId(null);
    }
  };

  // Generate voiceover for all scenes
  const handleGenerateAllVoiceovers = async () => {
    for (const scene of project.scenes) {
      if (scene.narration?.trim()) {
        await handleGenerateVoiceover(scene.id);
      }
    }
  };

  // Play audio preview
  const playAudio = (url: string) => {
    if (playingAudioUrl === url) {
      audioRef.current?.pause();
      setPlayingAudioUrl(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      setPlayingAudioUrl(url);
      audio.onended = () => setPlayingAudioUrl(null);
    }
  };

  // Render Master MP4 timeline assembly
  const handleRenderMaster = async () => {
    try {
      setIsRendering(true);
      setRenderProgress(15);
      setRenderStage('Validating takes and audio tracks...');

      const progressTimer = setInterval(() => {
        setRenderProgress((prev) => {
          if (prev < 85) return prev + 10;
          return prev;
        });
      }, 1200);

      const res = await fetch('/api/assembly/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          settings,
        }),
      });

      clearInterval(progressTimer);
      const data = await res.json();

      if (data.success) {
        setRenderProgress(100);
        setRenderStage('Master timeline exported successfully!');
        await onRefreshProject();
      } else {
        throw new Error(data.error || 'Assembly render failed');
      }
    } catch (err: any) {
      alert(`Render failed: ${err.message}`);
    } finally {
      setIsRendering(false);
    }
  };

  const totalRuntime = project.scenes.reduce((sum, s) => sum + (s.durationSeconds || 5), 0);
  const voiceoverCount = project.scenes.filter((s) => !!s.voiceoverUrl).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan">Stage 9 & 10</Badge>
            <h2 className="text-xl font-bold text-white">Multi-Track Audio & Timeline Assembly</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Synchronize TTS voiceover, burn styled subtitles (.ass), apply sidechain music ducking, and compile the final master MP4 video.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateAllVoiceovers}
            leftIcon={<Mic className="w-4 h-4 text-cyan-400" />}
          >
            Synthesize All TTS ({voiceoverCount}/{project.scenes.length})
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleRenderMaster}
            isLoading={isRendering}
            leftIcon={<Wand2 className="w-4 h-4 text-cyan-300" />}
          >
            {project.masterExportUrl ? 'Re-Render Master MP4' : 'Render Master MP4'}
          </Button>
        </div>
      </div>

      {/* Render Progress Bar */}
      {isRendering && (
        <div className="bg-[#111827] border border-cyan-500/40 rounded-2xl p-5 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Multi-Track FFmpeg Assembly Pipeline</span>
            </span>
            <span className="text-xs font-mono text-cyan-300 font-bold">{renderProgress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full transition-all duration-500"
              style={{ width: `${renderProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">{renderStage}</p>
        </div>
      )}

      {/* Master Video Preview (If already exported) */}
      {project.masterExportUrl && (
        <div className="bg-[#111827] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Master MP4 Video Ready</h3>
              <Badge variant="emerald" size="sm">
                1080p Master Export
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {project.masterSubtitlesUrl && (
                <a
                  href={project.masterSubtitlesUrl}
                  download={`${project.title}_subtitles.srt`}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download .SRT</span>
                </a>
              )}

              <a
                href={project.masterExportUrl}
                download={`${project.title}_master.mp4`}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Master MP4</span>
              </a>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video max-w-4xl mx-auto shadow-2xl relative">
            <video
              ref={masterVideoRef}
              src={project.masterExportUrl}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Interactive Multi-Track Timeline Visualizer */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Multi-Track Assembly Timeline</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Total Duration: {formatDuration(totalRuntime)} ({project.scenes.length} Scenes)
          </span>
        </div>

        {/* Tracks Stack */}
        <div className="space-y-4">
          {/* TRACK 1: VIDEO TRACK */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Film className="w-3.5 h-3.5" />
                <span>Track 1: Video Takes & Normalization (30fps)</span>
              </span>
              <span className="text-[10px] text-slate-500">Active takes concatenated</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
              {project.scenes.map((scene) => {
                const activeTake =
                  scene.takes?.find((t) => t.id === scene.activeTakeId) ||
                  scene.takes?.[scene.takes.length - 1];

                return (
                  <div
                    key={scene.id}
                    className="p-3 rounded-lg bg-[#141E33] border border-indigo-900/50 flex items-center gap-3 relative overflow-hidden"
                  >
                    <div className="w-12 h-10 rounded bg-slate-900 flex-shrink-0 overflow-hidden border border-slate-700">
                      {scene.keyframeUrl ? (
                        <img src={scene.keyframeUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-600">
                          Take
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        Scene {scene.order}: {scene.title}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>{scene.durationSeconds}s</span>
                        <span>•</span>
                        <span className="text-emerald-400">
                          {activeTake ? `Take #${activeTake.takeNumber}` : 'Auto-Gen'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 2: VOICEOVER (TTS) TRACK */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Mic className="w-3.5 h-3.5" />
                <span>Track 2: Voiceover Narration (TTS)</span>
              </span>
              <span className="text-[10px] text-slate-500">Word-level aligned</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#0B0F19] border border-slate-800">
              {project.scenes.map((scene) => {
                const isGen = generatingTtsSceneId === scene.id;
                const isPlaying = playingAudioUrl === scene.voiceoverUrl;

                return (
                  <div
                    key={scene.id}
                    className="p-3 rounded-lg bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300">
                          Scene {scene.order} VO
                        </span>
                        {scene.voiceoverUrl ? (
                          <Badge variant="emerald" size="sm">
                            Ready
                          </Badge>
                        ) : (
                          <Badge variant="default" size="sm">
                            Missing
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 italic">
                        "{scene.narration || 'No narration set'}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                      {scene.voiceoverUrl ? (
                        <button
                          onClick={() => playAudio(scene.voiceoverUrl!)}
                          className="px-2 py-1 rounded text-[10px] font-medium bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition flex items-center gap-1"
                        >
                          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          <span>{isPlaying ? 'Pause' : 'Preview VO'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGenerateVoiceover(scene.id)}
                          disabled={isGen || !scene.narration?.trim()}
                          className="px-2 py-1 rounded text-[10px] font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition flex items-center gap-1 disabled:opacity-40"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{isGen ? 'Generating...' : 'Generate VO'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 3: SUBTITLES TRACK */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
              <span className="flex items-center gap-1.5 text-purple-400">
                <Subtitles className="w-3.5 h-3.5" />
                <span>Track 3: Subtitles (.ASS / .SRT)</span>
              </span>
              <span className="text-[10px] text-slate-500">
                Style: {settings.subtitleStyle} • Burn-in: {settings.burnSubtitles ? 'On' : 'Off'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">Subtitle Style:</span>
                {(['cinematic', 'minimal', 'bold'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setSettings({ ...settings, subtitleStyle: style })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                      settings.subtitleStyle === style
                        ? 'bg-purple-600/30 text-purple-300 border-purple-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={settings.burnSubtitles}
                    onChange={(e) => setSettings({ ...settings, burnSubtitles: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0"
                  />
                  <span>Burn subtitles directly into master video</span>
                </label>
              </div>
            </div>
          </div>

          {/* TRACK 4: MUSIC & DUCKING TRACK */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Music className="w-3.5 h-3.5" />
                <span>Track 4: Background Score & Sidechain Ducking</span>
              </span>
              <span className="text-[10px] text-slate-500">
                Automatic ducking under speech active
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {musicTracks.map((track) => {
                  const isSelected = settings.selectedMusicId === track.id;

                  return (
                    <div
                      key={track.id}
                      onClick={() => setSettings({ ...settings, selectedMusicId: track.id })}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-emerald-950/20 border-emerald-500/60 shadow-sm'
                          : 'bg-[#111827] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{track.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{track.genre}</div>
                      <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                        {track.mood}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sliders: Volume & Ducking Intensity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-800">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Music Volume Level</span>
                    </span>
                    <span className="font-mono text-slate-400">
                      {Math.round(settings.musicVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.musicVolume}
                    onChange={(e) =>
                      setSettings({ ...settings, musicVolume: parseFloat(e.target.value) })
                    }
                    className="w-full accent-emerald-500 bg-slate-800"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Sidechain Ducking Under Narration</span>
                    </span>
                    <span className="font-mono text-slate-400">
                      {Math.round(settings.duckingIntensity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.duckingIntensity}
                    onChange={(e) =>
                      setSettings({ ...settings, duckingIntensity: parseFloat(e.target.value) })
                    }
                    className="w-full accent-cyan-500 bg-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
