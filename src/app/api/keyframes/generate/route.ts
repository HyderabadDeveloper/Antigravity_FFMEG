import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, saveProject } from '@/lib/storage';
import { generateKeyframeImage } from '@/lib/imageService';

export async function POST(req: NextRequest) {
  try {
    const { projectId, targetType, targetId, prompt, aspectRatio } = await req.json();

    if (!projectId || !targetId || !prompt) {
      return NextResponse.json(
        { success: false, error: 'projectId, targetId, and prompt are required' },
        { status: 400 }
      );
    }

    const project = getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const ratio = aspectRatio || project.aspectRatio || '16:9';
    const imageUrl = await generateKeyframeImage({
      prompt,
      aspectRatio: ratio,
    });

    if (targetType === 'character') {
      const charIndex = project.characters.findIndex((c) => c.id === targetId);
      if (charIndex >= 0) {
        project.characters[charIndex].referenceKeyframeUrl = imageUrl;
      }
    } else if (targetType === 'scene') {
      const sceneIndex = project.scenes.findIndex((s) => s.id === targetId);
      if (sceneIndex >= 0) {
        project.scenes[sceneIndex].keyframeUrl = imageUrl;
        project.scenes[sceneIndex].keyframeStatus = 'ready';
        if (project.scenes[sceneIndex].status === 'draft') {
          project.scenes[sceneIndex].status = 'keyframe_ready';
        }
      }
    }

    const saved = saveProject(project);

    return NextResponse.json({
      success: true,
      imageUrl,
      project: saved,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
