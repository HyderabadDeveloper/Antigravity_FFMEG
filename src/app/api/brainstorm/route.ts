import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, saveProject } from '@/lib/storage';
import { processBrainstormMessage } from '@/lib/aiService';
import { generateId } from '@/lib/utils';
import { ChatMessage } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { projectId, message } = await req.json();

    if (!projectId || !message) {
      return NextResponse.json(
        { success: false, error: 'projectId and message are required' },
        { status: 400 }
      );
    }

    const project = getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    // Append user message
    const userMsg: ChatMessage = {
      id: generateId('msg'),
      sender: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    project.brainstormMessages.push(userMsg);

    // Call AI director engine
    const aiResponse = await processBrainstormMessage(project, message);

    const assistantMsg: ChatMessage = {
      id: generateId('msg'),
      sender: 'assistant',
      content: aiResponse.reply,
      timestamp: new Date().toISOString(),
      suggestedScenes: aiResponse.suggestedScenes,
      suggestedBrief: aiResponse.suggestedBrief,
    };

    project.brainstormMessages.push(assistantMsg);

    // If character suggestions were produced, optionally append them or let user accept
    if (aiResponse.suggestedCharacters && aiResponse.suggestedCharacters.length > 0) {
      // Keep in project or let user accept
    }

    const saved = saveProject(project);

    return NextResponse.json({
      success: true,
      assistantMessage: assistantMsg,
      project: saved,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
