import { NextRequest, NextResponse } from 'next/server';
import { getProjects, saveProject } from '@/lib/storage';
import { Project } from '@/types';
import { generateId } from '@/lib/utils';

export async function GET() {
  try {
    const projects = getProjects();
    return NextResponse.json({ success: true, projects });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newProject: Project = {
      id: generateId('proj'),
      title: body.title || 'Untitled Video Project',
      concept: body.concept || '',
      targetDurationSeconds: Number(body.targetDurationSeconds) || 15,
      aspectRatio: body.aspectRatio || '16:9',
      resolution: body.resolution || '1080p',
      visualGenre: body.visualGenre || 'Cinematic Photorealistic',
      targetAudience: body.targetAudience || 'General Audience',
      creativeBrief: body.creativeBrief || {
        logline: body.concept || '',
        narrativeHook: '',
        visualTone: 'Cinematic, rich atmospheric depth',
        pacing: 'Dynamic and engaging',
        keyThemes: [],
        musicAtmosphere: 'Atmospheric cinematic score',
      },
      continuityRules: body.continuityRules || {
        lighting: 'Volumetric cinematic lighting with soft rim fill',
        cameraLensStyle: '35mm anamorphic prime lens, subtle film grain',
        colorPalette: 'Cinematic balanced palette',
        environmentTokens: 'High-fidelity environmental details',
        negativeConstraints: 'blurry, distorted anatomy, warped faces, oversaturated cgi, text watermark',
      },
      characters: body.characters || [],
      scenes: body.scenes || [],
      brainstormMessages: [
        {
          id: generateId('msg'),
          sender: 'assistant',
          content: `Welcome to the planning room for "${body.title || 'Untitled'}"! Let's build your scene breakdown and character continuity anchors. What angle or hook should we explore first?`,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = saveProject(newProject);
    return NextResponse.json({ success: true, project: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
