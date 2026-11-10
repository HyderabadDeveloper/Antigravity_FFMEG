import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, saveProject } from '@/lib/storage';
import { synthesizeVoiceover } from '@/lib/audio/ttsService';

export async function POST(req: NextRequest) {
  try {
    const { projectId, sceneId, voiceId } = await req.json();

    if (!projectId || !sceneId) {
      return NextResponse.json(
        { success: false, error: 'projectId and sceneId are required' },
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

    if (!scene.narration?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Scene has no narration text' },
        { status: 400 }
      );
    }

    const ttsResult = await synthesizeVoiceover({
      text: scene.narration,
      sceneId: scene.id,
      voiceId,
    });

    scene.voiceoverUrl = ttsResult.audioUrl;
    scene.voiceoverDuration = ttsResult.durationSeconds;
    saveProject(project);

    return NextResponse.json({
      success: true,
      voiceoverUrl: ttsResult.audioUrl,
      durationSeconds: ttsResult.durationSeconds,
      timestamps: ttsResult.timestamps,
      project,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
