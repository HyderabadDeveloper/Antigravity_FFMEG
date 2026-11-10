import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { getProjectById, saveProject } from '@/lib/storage';
import { getFfmpegPath } from '@/lib/ffmpeg/normalizer';
import { generateId } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { projectId, sceneId, takeId, inPointSeconds, outPointSeconds } = await req.json();

    if (!projectId || !sceneId || !takeId) {
      return NextResponse.json(
        { success: false, error: 'projectId, sceneId, and takeId are required' },
        { status: 400 }
      );
    }

    const project = getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const scene = project.scenes.find((s) => s.id === sceneId);
    if (!scene) {
      return NextResponse.json({ success: false, error: 'Scene not found' }, { status: 404 });
    }

    const take = scene.takes?.find((t) => t.id === takeId);
    if (!take) {
      return NextResponse.json({ success: false, error: 'Take not found' }, { status: 404 });
    }

    const inPoint = Math.max(0, parseFloat(inPointSeconds) || 0);
    const outPoint = Math.min(take.durationSeconds, parseFloat(outPointSeconds) || take.durationSeconds);
    const trimmedDuration = Math.max(1, outPoint - inPoint);

    // Resolve input normalized path
    const localNormName = take.normalizedVideoUrl.replace('/api/media/normalized/', '');
    const normDir = path.join(process.cwd(), 'data', 'media', 'normalized');
    const inputPath = path.join(normDir, localNormName);

    if (!fs.existsSync(inputPath)) {
      return NextResponse.json({ success: false, error: 'Source media file missing' }, { status: 404 });
    }

    const trimmedFileName = `trimmed_${generateId('trim')}.mp4`;
    const trimmedFilePath = path.join(normDir, trimmedFileName);

    // Run FFmpeg fast cut
    const ffmpeg = getFfmpegPath();
    await new Promise<void>((resolve, reject) => {
      const args = [
        '-y',
        '-ss', `${inPoint}`,
        '-i', inputPath,
        '-t', `${trimmedDuration}`,
        '-c', 'copy',
        '-movflags', '+faststart',
        trimmedFilePath,
      ];

      const proc = spawn(ffmpeg, args);
      proc.on('close', (code) => {
        if (code === 0 && fs.existsSync(trimmedFilePath)) {
          resolve();
        } else {
          reject(new Error(`Trimming failed with code ${code}`));
        }
      });
      proc.on('error', (err) => reject(err));
    });

    // Update take properties
    take.normalizedVideoUrl = `/api/media/normalized/${trimmedFileName}`;
    take.durationSeconds = Math.round(trimmedDuration);
    take.trimming = {
      inPointSeconds: inPoint,
      outPointSeconds: outPoint,
    };

    saveProject(project);

    return NextResponse.json({
      success: true,
      take,
      project,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
