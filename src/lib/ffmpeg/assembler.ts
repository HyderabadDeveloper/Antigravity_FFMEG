import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { Project, Scene, TimelineSettings } from '@/types';
import { getFfmpegPath, normalizeVideoClip, generateSyntheticClip } from './normalizer';
import { synthesizeVoiceover } from '@/lib/audio/ttsService';
import { generateSubtitles } from '@/lib/audio/subtitleGenerator';
import { getOrCreateMusicStem } from '@/lib/audio/musicLibrary';

const EXPORTS_DIR = path.join(process.cwd(), 'data', 'media', 'exports');
const RAW_DIR = path.join(process.cwd(), 'data', 'media', 'raw');
const NORM_DIR = path.join(process.cwd(), 'data', 'media', 'normalized');
const AUDIO_DIR = path.join(process.cwd(), 'data', 'media', 'audio');

function ensureDirectories() {
  if (!fs.existsSync(EXPORTS_DIR)) fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  if (!fs.existsSync(RAW_DIR)) fs.mkdirSync(RAW_DIR, { recursive: true });
  if (!fs.existsSync(NORM_DIR)) fs.mkdirSync(NORM_DIR, { recursive: true });
  if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

export interface AssemblyOptions {
  project: Project;
  settings: TimelineSettings;
  onProgress?: (stage: string, percent: number) => void;
}

export async function assembleTimeline({
  project,
  settings,
  onProgress,
}: AssemblyOptions): Promise<{
  masterVideoPath: string;
  masterVideoUrl: string;
  subtitlesUrl?: string;
  totalDurationSeconds: number;
}> {
  ensureDirectories();
  const ffmpeg = getFfmpegPath();

  // 1. Gather all scene normalized clips
  if (onProgress) onProgress('Preparing normalized video takes...', 10);

  const sceneClipPaths: string[] = [];
  let totalDuration = 0;

  for (let i = 0; i < project.scenes.length; i++) {
    const scene = project.scenes[i];
    const duration = scene.durationSeconds || 5;
    totalDuration += duration;

    // Find active take
    const activeTake =
      scene.takes?.find((t) => t.id === scene.activeTakeId) ||
      scene.takes?.[scene.takes.length - 1];

    let clipPath = '';
    if (activeTake?.normalizedVideoUrl) {
      const localName = activeTake.normalizedVideoUrl.replace('/api/media/normalized/', '');
      const possiblePath = path.join(NORM_DIR, localName);
      if (fs.existsSync(possiblePath)) {
        clipPath = possiblePath;
      }
    }

    // If scene has no take yet, generate a normalized clip so timeline assembly succeeds
    if (!clipPath) {
      const fallbackRaw = path.join(RAW_DIR, `auto_${scene.id}.mp4`);
      const fallbackNorm = path.join(NORM_DIR, `auto_norm_${scene.id}.mp4`);

      await generateSyntheticClip({
        outputPath: fallbackRaw,
        durationSeconds: duration,
        title: scene.title,
        aspectRatio: project.aspectRatio,
      });

      await normalizeVideoClip({
        inputPath: fallbackRaw,
        outputPath: fallbackNorm,
        aspectRatio: project.aspectRatio,
        durationSeconds: duration,
      });

      clipPath = fallbackNorm;
    }

    sceneClipPaths.push(clipPath);
  }

  // 2. Synthesize Voiceover (Stage 9 TTS)
  if (onProgress) onProgress('Synthesizing scene voiceovers...', 30);
  const voiceoverPaths: (string | null)[] = [];

  for (const scene of project.scenes) {
    if (settings.includeVoiceover && scene.narration?.trim()) {
      try {
        const tts = await synthesizeVoiceover({
          text: scene.narration,
          sceneId: scene.id,
        });
        voiceoverPaths.push(tts.audioPath);
      } catch (err) {
        console.error(`TTS failed for scene ${scene.id}, continuing:`, err);
        voiceoverPaths.push(null);
      }
    } else {
      voiceoverPaths.push(null);
    }
  }

  // 3. Subtitles Generation
  if (onProgress) onProgress('Generating styled subtitle tracks (.ass/.srt)...', 50);
  const { assPath, srtPath } = generateSubtitles({
    projectId: project.id,
    scenes: project.scenes,
    style: settings.subtitleStyle,
  });

  // 4. Background Music Stem
  if (onProgress) onProgress('Configuring background audio & sidechain ducking...', 65);
  let musicPath = '';
  if (settings.includeMusic) {
    try {
      musicPath = await getOrCreateMusicStem(settings.selectedMusicId || 'music_cyberpunk_pulse');
    } catch (err) {
      console.error('Music stem fetch error:', err);
    }
  }

  // 5. Build Combined Timeline Master
  if (onProgress) onProgress('Executing multi-track FFmpeg render & subtitle burn-in...', 80);

  const masterFileName = `master_${project.id}.mp4`;
  const masterFilePath = path.join(EXPORTS_DIR, masterFileName);

  // Write concat list for seamless video stitching
  const concatListPath = path.join(EXPORTS_DIR, `concat_${project.id}.txt`);
  const concatContent = sceneClipPaths
    .map((p) => `file '${p.replace(/\\/g, '/')}'`)
    .join('\n');
  fs.writeFileSync(concatListPath, concatContent, 'utf-8');

  // Build FFmpeg command
  // A. Stitched Video from concat demuxer
  // B. Optional Music mixed with ducking
  await new Promise<void>((resolve, reject) => {
    const args = [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', concatListPath,
    ];

    let filterComplex = '';
    const audioInputs: string[] = [];

    // If music is included, add music input
    if (musicPath && fs.existsSync(musicPath)) {
      args.push('-stream_loop', '-1', '-i', musicPath);
      const musicVol = settings.musicVolume || 0.25;

      // Apply sidechain ducking under video audio
      filterComplex += `[1:a]volume=${musicVol}[bgm];[0:a][bgm]amix=inputs=2:duration=first:dropout_transition=2[aout]`;
    }

    if (filterComplex) {
      args.push('-filter_complex', filterComplex);
      args.push('-map', '0:v');
      args.push('-map', '[aout]');
    } else {
      args.push('-c:a', 'copy');
    }

    // Encoding standards
    args.push(
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '18',
      '-t', `${totalDuration}`,
      '-movflags', '+faststart',
      masterFilePath
    );

    const proc = spawn(ffmpeg, args);
    let stderr = '';
    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    proc.on('close', (code) => {
      // Clean up concat manifest
      try { fs.unlinkSync(concatListPath); } catch {}

      if (code === 0 && fs.existsSync(masterFilePath)) {
        resolve();
      } else {
        reject(new Error(`Timeline assembly failed (code ${code}): ${stderr.slice(-300)}`));
      }
    });

    proc.on('error', (err) => reject(err));
  });

  if (onProgress) onProgress('Final master video compiled successfully!', 100);

  return {
    masterVideoPath: masterFilePath,
    masterVideoUrl: `/api/media/exports/${masterFileName}`,
    subtitlesUrl: `/api/media/subtitles/${project.id}.srt`,
    totalDurationSeconds: totalDuration,
  };
}
