import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, saveProject, deleteProject } from '@/lib/storage';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = getProjectById(params.id);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const existing = getProjectById(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const updated = saveProject({
      ...existing,
      ...body,
      id: existing.id, // preserve id
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = deleteProject(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
