import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, saveProject } from '@/lib/storage';
import { synthesizeAllScenePrompts } from '@/lib/promptEngine';

export async function POST(req: NextRequest) {
  try {
    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 });
    }

    const project = getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const updatedScenes = synthesizeAllScenePrompts(project);
    project.scenes = updatedScenes;

    const saved = saveProject(project);

    return NextResponse.json({
      success: true,
      scenes: saved.scenes,
      project: saved,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
