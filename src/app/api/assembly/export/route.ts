import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, saveProject } from '@/lib/storage';
import { assembleTimeline } from '@/lib/ffmpeg/assembler';
import { TimelineSettings } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { projectId, settings } = await req.json();

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 });
    }

    const project = getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const timelineSettings: TimelineSettings = settings || {
      transitionType: 'cut',
      transitionDurationSeconds: 0.5,
      includeVoiceover: true,
      includeMusic: true,
      selectedMusicId: 'music_cyberpunk_pulse',
      musicVolume: 0.25,
      duckingIntensity: 0.7,
      burnSubtitles: false,
      subtitleStyle: 'cinematic',
    };

    project.timelineSettings = timelineSettings;

    // Run timeline assembly
    const result = await assembleTimeline({
      project,
      settings: timelineSettings,
    });

    project.masterExportUrl = result.masterVideoUrl;
    project.masterSubtitlesUrl = result.subtitlesUrl;
    const saved = saveProject(project);

    return NextResponse.json({
      success: true,
      masterVideoUrl: result.masterVideoUrl,
      subtitlesUrl: result.subtitlesUrl,
      durationSeconds: result.totalDurationSeconds,
      project: saved,
    });
  } catch (err: any) {
    console.error('Assembly export error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
