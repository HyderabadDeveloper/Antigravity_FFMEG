import { NextRequest, NextResponse } from 'next/server';
import { queueManager } from '@/lib/queue/queueManager';
import { getProjectById } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const { projectId, sceneId, providerId = 'runway', batch = false } = await req.json();

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 });
    }

    const project = getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    if (batch) {
      // Enqueue all scenes in the project
      const jobs = [];
      for (const scene of project.scenes) {
        const job = await queueManager.enqueueSceneJob({
          projectId,
          sceneId: scene.id,
          providerId,
        });
        jobs.push(job);
      }
      return NextResponse.json({ success: true, count: jobs.length, jobs });
    } else {
      if (!sceneId) {
        return NextResponse.json({ success: false, error: 'sceneId is required' }, { status: 400 });
      }

      const job = await queueManager.enqueueSceneJob({
        projectId,
        sceneId,
        providerId,
      });

      return NextResponse.json({ success: true, job });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
