import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { MusicTrack } from '@/types';
import { getFfmpegPath } from '@/lib/ffmpeg/normalizer';

const MUSIC_DIR = path.join(process.cwd(), 'data', 'media', 'music');

function ensureMusicDir() {
  if (!fs.existsSync(MUSIC_DIR)) {
    fs.mkdirSync(MUSIC_DIR, { recursive: true });
  }
}

export const PRESET_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'music_cyberpunk_pulse',
    title: 'Neon Pulse',
    genre: 'Synthwave / Cyberpunk',
    tempo: '110 BPM',
    mood: 'Futuristic, High-Tension, Analog Synthesizer',
    audioUrl: '/api/media/music/music_cyberpunk_pulse.mp3',
    durationSeconds: 60,
  },
  {
    id: 'music_ambient_drama',
    title: 'Aetheria Drift',
    genre: 'Cinematic Ambient',
    tempo: '75 BPM',
    mood: 'Atmospheric, Deep Sub-bass, Melancholic',
    audioUrl: '/api/media/music/music_ambient_drama.mp3',
    durationSeconds: 60,
  },
  {
    id: 'music_dark_tension',
    title: 'Shadow Corridor',
    genre: 'Dark Cinematic Noir',
    tempo: '90 BPM',
    mood: 'Suspenseful, Cold Chiaroscuro, Sub-Bass Drone',
    audioUrl: '/api/media/music/music_dark_tension.mp3',
    durationSeconds: 60,
  },
];

/**
 * Ensures the selected background music stem exists on disk.
 * If missing, generates a harmonic ambient cinematic music track via FFmpeg.
 */
export async function getOrCreateMusicStem(trackId: string): Promise<string> {
  ensureMusicDir();
  const filePath = path.join(MUSIC_DIR, `${trackId}.mp3`);

  if (fs.existsSync(filePath)) {
    return filePath;
  }

  // Procedural harmonic music generation
  const ffmpeg = getFfmpegPath();
  const track = PRESET_MUSIC_TRACKS.find((t) => t.id === trackId) || PRESET_MUSIC_TRACKS[0];
  const duration = track.durationSeconds || 60;

  // Generate multi-oscillator cinematic chord drone with soft pulse
  await new Promise<void>((resolve, reject) => {
    const args = [
      '-y',
      '-f', 'lavfi', '-i', `sine=frequency=110:duration=${duration}:sample_rate=48000`, // A2
      '-f', 'lavfi', '-i', `sine=frequency=164.81:duration=${duration}:sample_rate=48000`, // E3
      '-f', 'lavfi', '-i', `sine=frequency=220:duration=${duration}:sample_rate=48000`, // A3
      '-f', 'lavfi', '-i', `sine=frequency=55:duration=${duration}:sample_rate=48000`, // Sub bass A1
      '-filter_complex',
      `[0:a]volume=0.25,lowpass=f=300[bass];` +
      `[1:a]volume=0.2,tremolo=f=0.5:d=0.5[mid];` +
      `[2:a]volume=0.15,chorus=0.7:0.9:55:0.4:0.25:2[high];` +
      `[3:a]volume=0.35,lowpass=f=120[sub];` +
      `[bass][mid][high][sub]amix=inputs=4:duration=longest,volume=0.8[out]`,
      '-map', '[out]',
      '-c:a', 'libmp3lame',
      '-ar', '48000',
      '-b:a', '192k',
      filePath,
    ];

    const proc = spawn(ffmpeg, args);
    proc.on('close', (code) => {
      if (code === 0 && fs.existsSync(filePath)) {
        resolve();
      } else {
        reject(new Error(`Music stem generation failed with code ${code}`));
      }
    });
    proc.on('error', (err) => reject(err));
  });

  return filePath;
}
