'use client';

import React, { useState } from 'react';
import { Project, VideoGenerationRequest } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Share2,
  Download,
  Copy,
  Check,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface ProviderExportTabProps {
  project: Project;
}

export const ProviderExportTab: React.FC<ProviderExportTabProps> = ({ project }) => {
  const [selectedProvider, setSelectedProvider] = useState<'runway' | 'veo' | 'luma' | 'kling'>('runway');
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Translate project into unified VideoGenerationRequests (from Section 4 of Architecture doc)
  const unifiedRequests: VideoGenerationRequest[] = project.scenes.map((scene) => ({
    prompt: scene.synthesizedPrompt || scene.visualDescription,
    negativePrompt: project.continuityRules.negativeConstraints,
    referenceImages: [
      ...(scene.keyframeUrl ? [{ url: scene.keyframeUrl, role: 'first_frame' as const }] : []),
      ...project.characters
        .filter((c) => scene.characterIds.includes(c.id) && c.referenceKeyframeUrl)
        .map((c) => ({ url: c.referenceKeyframeUrl!, role: 'character_ref' as const })),
    ],
    durationSeconds: scene.durationSeconds,
    aspectRatio: project.aspectRatio,
    resolution: project.resolution,
    cameraMovement: scene.cameraMovement,
  }));

  const copyBatchPrompts = () => {
    const text = project.scenes
      .map(
        (s) =>
          `=== SCENE ${s.order}: ${s.title} (${s.durationSeconds}s) ===\nCamera: ${s.cameraMovement}\nKeyframe: ${s.keyframeUrl || 'None'}\nPrompt:\n${s.synthesizedPrompt || s.visualDescription}\n`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2000);
  };

  const downloadProductionBible = () => {
    let md = `# Production Bible: ${project.title}\n\n`;
    md += `**Visual Genre**: ${project.visualGenre} | **Aspect Ratio**: ${project.aspectRatio} | **Runtime**: ${project.targetDurationSeconds}s\n\n`;
    md += `## 1. Creative Brief\n- **Logline**: ${project.creativeBrief.logline || '-'}\n- **Opening Hook**: ${project.creativeBrief.narrativeHook || '-'}\n- **Visual Tone**: ${project.creativeBrief.visualTone || '-'}\n- **Pacing**: ${project.creativeBrief.pacing || '-'}\n- **Sonic Atmosphere**: ${project.creativeBrief.musicAtmosphere || '-'}\n\n`;
    md += `## 2. Master Continuity Rules\n- **Lighting**: ${project.continuityRules.lighting}\n- **Lens & Camera**: ${project.continuityRules.cameraLensStyle}\n- **Color Palette**: ${project.continuityRules.colorPalette}\n- **Environment**: ${project.continuityRules.environmentTokens}\n- **Negative Constraints**: ${project.continuityRules.negativeConstraints}\n\n`;
    md += `## 3. Character Consistency Roster\n`;
    project.characters.forEach((c) => {
      md += `### ${c.name} (${c.role})\n- **Visual Summary**: ${c.visualSummary}\n- **Wardrobe**: ${c.attireTokens}\n- **Distinguishing**: ${c.distinguishingFeatures}\n- **Reference Keyframe**: ${c.referenceKeyframeUrl || 'None'}\n\n`;
    });
    md += `## 4. Scene Breakdown & Prompts\n`;
    project.scenes.forEach((s) => {
      md += `### Scene ${s.order}: ${s.title} (${s.durationSeconds}s)\n- **Narration (TTS)**: "${s.narration || ''}"\n- **Camera**: ${s.cameraMovement}\n- **Keyframe Anchor**: ${s.keyframeUrl || 'None'}\n- **Synthesized Prompt**:\n\`\`\`text\n${s.synthesizedPrompt || s.visualDescription}\n\`\`\`\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_bible.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadJsonPayload = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_export.json`);
    dlAnchor.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan">Stage 6</Badge>
            <h2 className="text-xl font-bold text-white">Provider Adapter & Export Studio</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Export the structured scenes, character continuity tokens, and visual keyframe anchors formatted for video generation engines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadProductionBible}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Bible (.md)
          </Button>
          <Button
            variant="neon"
            size="sm"
            onClick={downloadJsonPayload}
            leftIcon={<Share2 className="w-4 h-4" />}
          >
            Export Phase 2 JSON
          </Button>
        </div>
      </div>

      {/* Provider Selector & Format Inspector */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Provider Dispatch Payload Preview</h3>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: 'runway', label: 'Runway Gen-3 Alpha (I2V)' },
              { id: 'veo', label: 'Google Veo (Vertex AI)' },
              { id: 'luma', label: 'Luma Dream Machine' },
              { id: 'kling', label: 'Kling AI' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProvider(p.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                  selectedProvider === p.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-[#0B0F19] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Provider Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs space-y-1">
            <span className="text-slate-400">Target Model:</span>
            <div className="font-bold text-white text-sm">
              {selectedProvider === 'runway' && 'Runway Gen-3 Alpha / Turbo'}
              {selectedProvider === 'veo' && 'Google Veo (Vertex GenAI)'}
              {selectedProvider === 'luma' && 'Luma Dream Machine Ray-2'}
              {selectedProvider === 'kling' && 'Kling AI 1.5 HD'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs space-y-1">
            <span className="text-slate-400">Conditioning Mode:</span>
            <div className="font-bold text-cyan-300 text-sm">
              Image-to-Video (I2V) Keyframe Anchored
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs space-y-1">
            <span className="text-slate-400">Dispatch Readiness:</span>
            <div className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>{project.scenes.length} Scenes Ready for Phase 2 Worker</span>
            </div>
          </div>
        </div>

        {/* Payload Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">
              Generated Unified Request Array ({unifiedRequests.length} Scene Jobs)
            </span>
            <Button
              variant="outline"
              size="xs"
              onClick={copyBatchPrompts}
              leftIcon={copiedBatch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copiedBatch ? 'Copied Prompts' : 'Copy All Scene Prompts'}
            </Button>
          </div>

          <pre className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs text-cyan-300 font-mono overflow-x-auto max-h-96 scrollbar-thin">
            {JSON.stringify(unifiedRequests, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
