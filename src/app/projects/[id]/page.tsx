'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Project, Scene, CharacterProfile, CreativeBrief } from '@/types';
import { Header } from '@/components/Header';
import { StudioHeader, StudioTab } from '@/components/studio/StudioHeader';
import { IntakeConceptTab } from '@/components/studio/IntakeConceptTab';
import { BrainstormChatTab } from '@/components/studio/BrainstormChatTab';
import { ContinuityTab } from '@/components/studio/ContinuityTab';
import { SceneStoryboardTab } from '@/components/studio/SceneStoryboardTab';
import { KeyframeStudioTab } from '@/components/studio/KeyframeStudioTab';
import { ProviderExportTab } from '@/components/studio/ProviderExportTab';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ProjectStudioPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<StudioTab>('storyboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isGeneratingKeyframe, setIsGeneratingKeyframe] = useState(false);

  // Fetch project data
  const fetchProject = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      if (!data.success || !data.project) {
        throw new Error(data.error || 'Project not found');
      }
      setProject(data.project);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // Update project in DB & local state
  const handleUpdateProject = async (updates: Partial<Project>) => {
    if (!project) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success && data.project) {
        setProject(data.project);
      }
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  };

  // Synthesize prompts for all scenes
  const handleSynthesizePrompts = async () => {
    if (!project) return;
    try {
      setIsSynthesizing(true);
      const res = await fetch('/api/synthesize-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (data.success && data.project) {
        setProject(data.project);
      }
    } catch (err) {
      console.error('Failed to synthesize prompts:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Send message in Brainstorm Chat
  const handleSendMessage = async (message: string) => {
    if (!project) return;
    try {
      setIsSendingMessage(true);
      const res = await fetch('/api/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, message }),
      });
      const data = await res.json();
      if (data.success && data.project) {
        setProject(data.project);
      }
    } catch (err) {
      console.error('Failed to send brainstorm message:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Add suggested scene from AI Chat directly to Storyboard
  const handleAddSceneFromSuggestion = async (suggestedScene: Partial<Scene>) => {
    if (!project) return;
    const newOrder = project.scenes.length + 1;
    const scene: Scene = {
      id: suggestedScene.id || `scene_${Date.now()}`,
      projectId: project.id,
      order: newOrder,
      title: suggestedScene.title || `Scene ${newOrder}`,
      durationSeconds: suggestedScene.durationSeconds || 5,
      narration: suggestedScene.narration || '',
      characterIds: suggestedScene.characterIds || [],
      visualDescription: suggestedScene.visualDescription || '',
      cameraMovement: suggestedScene.cameraMovement || 'dolly_in',
      lightingAndAtmosphere: suggestedScene.lightingAndAtmosphere,
      synthesizedPrompt: '',
      status: 'draft',
    };

    const updatedScenes = [...project.scenes, scene];
    await handleUpdateProject({ scenes: updatedScenes });
  };

  // Apply suggested brief from AI Chat to Creative Brief
  const handleApplyBriefSuggestion = async (suggestedBrief: Partial<CreativeBrief>) => {
    if (!project) return;
    const updatedBrief = {
      ...project.creativeBrief,
      ...suggestedBrief,
    };
    await handleUpdateProject({ creativeBrief: updatedBrief });
  };

  // Generate reference keyframe image
  const handleGenerateKeyframe = async (
    targetType: 'character' | 'scene',
    targetId: string,
    prompt: string
  ) => {
    if (!project) return;
    try {
      setIsGeneratingKeyframe(true);
      const res = await fetch('/api/keyframes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          targetType,
          targetId,
          prompt,
          aspectRatio: project.aspectRatio,
        }),
      });
      const data = await res.json();
      if (data.success && data.project) {
        setProject(data.project);
      }
    } catch (err) {
      console.error('Failed to generate keyframe:', err);
    } finally {
      setIsGeneratingKeyframe(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-xs text-slate-400">Loading creative workspace & continuity rules...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-white">Project Not Found</h2>
        <p className="text-xs text-slate-400 mt-1 mb-5">{error || 'Could not load project.'}</p>
        <Button variant="secondary" onClick={() => router.push('/')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col text-slate-100">
      <Header />
      <StudioHeader
        project={project}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSynthesizePrompts={handleSynthesizePrompts}
        isSynthesizing={isSynthesizing}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'concept' && (
          <IntakeConceptTab project={project} onUpdateProject={handleUpdateProject} />
        )}

        {activeTab === 'brainstorm' && (
          <BrainstormChatTab
            project={project}
            onSendMessage={handleSendMessage}
            onAddScene={handleAddSceneFromSuggestion}
            onApplyBrief={handleApplyBriefSuggestion}
            isSending={isSendingMessage}
          />
        )}

        {activeTab === 'continuity' && (
          <ContinuityTab
            project={project}
            onUpdateProject={handleUpdateProject}
            onGenerateKeyframe={handleGenerateKeyframe}
            isGeneratingKeyframe={isGeneratingKeyframe}
          />
        )}

        {activeTab === 'storyboard' && (
          <SceneStoryboardTab
            project={project}
            onUpdateProject={handleUpdateProject}
            onGenerateKeyframe={handleGenerateKeyframe}
            isGeneratingKeyframe={isGeneratingKeyframe}
          />
        )}

        {activeTab === 'keyframes' && (
          <KeyframeStudioTab
            project={project}
            onGenerateKeyframe={handleGenerateKeyframe}
            isGeneratingKeyframe={isGeneratingKeyframe}
          />
        )}

        {activeTab === 'export' && <ProviderExportTab project={project} />}
      </main>
    </div>
  );
}
