'use client';

import React, { useState } from 'react';
import { Project, CharacterProfile, Scene } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  ImageIcon,
  Maximize2,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  Copy,
  Check,
  Users,
  Film,
  X,
} from 'lucide-react';

interface KeyframeStudioTabProps {
  project: Project;
  onGenerateKeyframe: (
    targetType: 'character' | 'scene',
    targetId: string,
    prompt: string
  ) => Promise<void>;
  isGeneratingKeyframe: boolean;
}

export const KeyframeStudioTab: React.FC<KeyframeStudioTabProps> = ({
  project,
  onGenerateKeyframe,
  isGeneratingKeyframe,
}) => {
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    title: string;
    prompt: string;
  } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const handleGenerate = async (
    targetType: 'character' | 'scene',
    targetId: string,
    prompt: string
  ) => {
    try {
      setGeneratingId(targetId);
      await onGenerateKeyframe(targetType, targetId, prompt);
    } finally {
      setGeneratingId(null);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const characterAnchors = project.characters;
  const sceneAnchors = project.scenes;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan">Stage 4 & 5</Badge>
            <h2 className="text-xl font-bold text-white">Visual Reference Anchors (I2V Studio)</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Generate high-fidelity keyframe images using Flux to serve as Image-to-Video conditioning anchors for Google Veo and Runway Gen-3.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="emerald" className="px-3 py-1 text-xs">
            Flux Model Active
          </Badge>
        </div>
      </div>

      {/* Character Visual Anchors */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-semibold text-white">
            Character Reference Sheets ({characterAnchors.length})
          </h3>
        </div>

        {characterAnchors.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 bg-[#111827] rounded-xl border border-slate-800">
            No characters registered yet. Add characters in the Continuity tab.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {characterAnchors.map((char) => {
              const charPrompt = `${char.name}, ${char.visualSummary}, wearing ${char.attireTokens}, ${char.distinguishingFeatures}, ${project.continuityRules.lighting}, 8k portrait, masterpiece`;
              const isGenThis = generatingId === char.id;

              return (
                <div
                  key={char.id}
                  className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-lg group hover:border-slate-700 transition"
                >
                  <div className="relative h-56 bg-slate-900 overflow-hidden">
                    {char.referenceKeyframeUrl ? (
                      <img
                        src={char.referenceKeyframeUrl}
                        alt={char.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-950/70">
                        <ImageIcon className="w-8 h-8 text-slate-700 mb-1" />
                        <span className="text-xs text-slate-500">No Reference Anchor</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />

                    {/* Overlay controls */}
                    <div className="absolute top-3 left-3">
                      <Badge variant="indigo" size="sm">
                        {char.role}
                      </Badge>
                    </div>

                    {char.referenceKeyframeUrl && (
                      <button
                        onClick={() =>
                          setPreviewImage({
                            url: char.referenceKeyframeUrl!,
                            title: `${char.name} (Character Reference)`,
                            prompt: charPrompt,
                          })
                        }
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white backdrop-blur-md transition"
                        title="View Full Resolution"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="font-bold text-white text-sm">{char.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                        {char.visualSummary}
                      </p>
                    </div>

                    <Button
                      variant={char.referenceKeyframeUrl ? 'secondary' : 'neon'}
                      size="sm"
                      className="w-full"
                      isLoading={isGenThis}
                      disabled={isGeneratingKeyframe}
                      onClick={() => handleGenerate('character', char.id, charPrompt)}
                      leftIcon={
                        char.referenceKeyframeUrl ? (
                          <RefreshCw className="w-3.5 h-3.5" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )
                      }
                    >
                      {char.referenceKeyframeUrl ? 'Regenerate Anchor' : 'Generate Visual Anchor'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scene Keyframe Anchors */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-white">
            Scene First-Frame Anchors ({sceneAnchors.length})
          </h3>
        </div>

        {sceneAnchors.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 bg-[#111827] rounded-xl border border-slate-800">
            No scenes created yet. Add scenes in the Storyboard tab.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {sceneAnchors.map((scene) => {
              const scenePrompt =
                scene.synthesizedPrompt || scene.visualDescription || scene.title;
              const isGenThis = generatingId === scene.id;

              return (
                <div
                  key={scene.id}
                  className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-lg group hover:border-slate-700 transition"
                >
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    {scene.keyframeUrl ? (
                      <img
                        src={scene.keyframeUrl}
                        alt={scene.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-950/70">
                        <ImageIcon className="w-8 h-8 text-slate-700 mb-1" />
                        <span className="text-xs text-slate-500">No Keyframe</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />

                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold">
                        Scene {scene.order}
                      </span>
                    </div>

                    {scene.keyframeUrl && (
                      <button
                        onClick={() =>
                          setPreviewImage({
                            url: scene.keyframeUrl!,
                            title: `Scene ${scene.order}: ${scene.title}`,
                            prompt: scenePrompt,
                          })
                        }
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white backdrop-blur-md transition"
                        title="View Full Resolution"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{scene.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                        {scene.visualDescription}
                      </p>
                    </div>

                    <Button
                      variant={scene.keyframeUrl ? 'secondary' : 'neon'}
                      size="sm"
                      className="w-full"
                      isLoading={isGenThis}
                      disabled={isGeneratingKeyframe}
                      onClick={() => handleGenerate('scene', scene.id, scenePrompt)}
                      leftIcon={
                        scene.keyframeUrl ? (
                          <RefreshCw className="w-3.5 h-3.5" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )
                      }
                    >
                      {scene.keyframeUrl ? 'Regenerate Anchor' : 'Generate Keyframe'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox / High-Res Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative max-w-4xl w-full bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="font-semibold text-white text-sm">{previewImage.title}</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[70vh] flex flex-col items-center justify-center overflow-auto bg-black/40">
              <img
                src={previewImage.url}
                alt=""
                className="max-h-[55vh] object-contain rounded-xl border border-slate-800"
              />
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#0B0F19] flex items-center justify-between gap-4">
              <div className="text-xs text-slate-400 line-clamp-2 flex-1">
                <span className="font-semibold text-slate-300">Prompt: </span>
                <span>{previewImage.prompt}</span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyUrl(previewImage.url)}
                  leftIcon={copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedUrl ? 'Copied' : 'Copy URL'}
                </Button>
                <a
                  href={previewImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 flex items-center gap-1.5 transition"
                >
                  <span>Open Raw</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
