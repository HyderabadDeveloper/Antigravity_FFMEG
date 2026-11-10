import fs from 'fs';
import path from 'path';
import { Scene } from '@/types';

const SUBTITLES_DIR = path.join(process.cwd(), 'data', 'media', 'subtitles');

function ensureSubtitleDir() {
  if (!fs.existsSync(SUBTITLES_DIR)) {
    fs.mkdirSync(SUBTITLES_DIR, { recursive: true });
  }
}

function formatSrtTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor(ms % 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
    seconds
  ).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

function formatAssTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centis = Math.floor((ms % 1000) / 10);

  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0'
  )}.${String(centis).padStart(2, '0')}`;
}

export interface SubtitleOptions {
  projectId: string;
  scenes: Scene[];
  style?: 'cinematic' | 'minimal' | 'bold';
}

/**
 * Generates both .ass (styled Advanced SubStation Alpha) and .srt files for the timeline.
 */
export function generateSubtitles({
  projectId,
  scenes,
  style = 'cinematic',
}: SubtitleOptions): { assPath: string; srtPath: string; srtContent: string; assContent: string } {
  ensureSubtitleDir();

  const assPath = path.join(SUBTITLES_DIR, `${projectId}.ass`);
  const srtPath = path.join(SUBTITLES_DIR, `${projectId}.srt`);

  // Style configurations for ASS subtitles
  let primaryColor = '&H00FFFFFF'; // White (BGR format in ASS)
  let outlineColor = '&H00000000'; // Black
  let backColor = '&H80000000'; // Semi-transparent black shadow
  let fontSize = 42;
  let bold = 1;

  if (style === 'cinematic') {
    primaryColor = '&H00F3F4F6'; // Soft silver white
    outlineColor = '&H00111827';
    fontSize = 44;
  } else if (style === 'bold') {
    primaryColor = '&H0022D3EE'; // Cyan accent
    outlineColor = '&H00000000';
    fontSize = 48;
    bold = 1;
  } else if (style === 'minimal') {
    primaryColor = '&H00E2E8F0';
    outlineColor = '&H00000000';
    fontSize = 36;
    bold = 0;
  }

  // Build ASS Header
  let ass = `[Script Info]
Title: Antigravity AI Master Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,${fontSize},${primaryColor},&H000000FF,${outlineColor},${backColor},${bold},0,0,0,100,100,0,0,1,2,2,2,40,40,65,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  let srt = '';
  let cumulativeMs = 0;
  let srtIndex = 1;

  for (const scene of scenes) {
    const sceneDurationMs = (scene.durationSeconds || 5) * 1000;
    const text = scene.narration?.trim();

    if (text) {
      // Split into 1 or 2 readable subtitle chunks if text is long
      const words = text.split(/\s+/);
      const chunks: string[] = [];

      if (words.length > 9) {
        const mid = Math.ceil(words.length / 2);
        chunks.push(words.slice(0, mid).join(' '));
        chunks.push(words.slice(mid).join(' '));
      } else {
        chunks.push(text);
      }

      const chunkDurationMs = (sceneDurationMs - 400) / chunks.length;
      let chunkStartMs = cumulativeMs + 200;

      for (const chunk of chunks) {
        const chunkEndMs = chunkStartMs + chunkDurationMs - 100;

        // ASS Event
        ass += `Dialogue: 0,${formatAssTime(chunkStartMs)},${formatAssTime(
          chunkEndMs
        )},Default,,0,0,0,,${chunk}\n`;

        // SRT Event
        srt += `${srtIndex}\n${formatSrtTime(chunkStartMs)} --> ${formatSrtTime(
          chunkEndMs
        )}\n${chunk}\n\n`;

        srtIndex++;
        chunkStartMs = chunkEndMs + 100;
      }
    }

    cumulativeMs += sceneDurationMs;
  }

  fs.writeFileSync(assPath, ass, 'utf-8');
  fs.writeFileSync(srtPath, srt, 'utf-8');

  return {
    assPath,
    srtPath,
    srtContent: srt,
    assContent: ass,
  };
}
