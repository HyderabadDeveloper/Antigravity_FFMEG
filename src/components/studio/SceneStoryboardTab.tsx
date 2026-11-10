'use client';

import React, { useState } from 'react';
import { Project, Scene } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SceneModal } from './SceneModal';
import {
  Film,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  Sparkles,
  Camera,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  Mic,
  ImageIcon,
} from 'lucide-react';
import { estimateWordReadingTimeSeconds } from '@/lib/utils';

interface SceneStoryboardTabProps {
  project: Project;
  onUpdateProject: (updates: Partial<Project>) => Promise<void>;
  onGenerateKeyframe: (
    targetType: 'character' | 'scene',
    targetId: string,
    prompt: string
  ) => Promise<void>;
  isGeneratingKeyframe: boolean;
}

export const SceneStoryboardTab: React.FC<SceneStoryboardTabProps> = ({
  project,
  onUpdateProject,
  onGenerateKeyframe,
  isGeneratingKeyframe,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const handleSaveScene = async (scene: Scene) => {
    const existingIndex = project.scenes.findIndex((s) => s.id === scene.id);
    let updatedScenes = [...project.scenes];

    if (existingIndex >= 0) {
      updatedScenes[existingIndex] = scene;
    } else {
      updatedScenes.push(scene);
    }

    // Ensure orders are sequential
    updatedScenes = updatedScenes.map((s, idx) => ({ ...s, order: idx + 1 }));

    await onUpdateProject({ scenes: updatedScenes });
  };

  const handleDeleteScene = async (sceneId: string) => {
    if (!confirm('Are you sure you want to delete this scene?')) return;
    const filtered = project.scenes.filter((s) => s.id !== sceneId);
    const reordered = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
    await onUpdateProject({ scenes: reordered });
  };

  const handleMoveScene = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= project.scenes.length) return;

    const updated = [...project.scenes];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;

    const reordered = updated.map((s, idx) => ({ ...s, order: idx + 1 }));
    await onUpdateProject({ scenes: reordered });
  };

  const copyToClipboard = (text: string, sceneId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(sceneId);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan">Stage 4 & 5</Badge>
            <h2 className="text-xl font-bold text-white">Scene Storyboard & Prompt Synthesis</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Deconstruct your brief into sequential video takes with assigned camera choreography, narration, and model-ready prompts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#0B0F19] border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Storyboard Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Table Breakdown View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            onClick={() => {
              setSelectedScene(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Scene
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {project.scenes.length === 0 ? (
        <div className="p-12 text-center bg-[#111827] border border-dashed border-slate-800 rounded-2xl">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-white">No scenes in this storyboard yet</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Add scenes manually or use the AI Director Chat to suggest an entire scene breakdown from your brief.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedScene(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Scene 1
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Storyboard View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {project.scenes.map((scene, index) => {
            const assignedChars = project.characters.filter((c) =>
              scene.characterIds.includes(c.id)
            );
            const estRead = estimateWordReadingTimeSeconds(scene.narration);

            return (
              <div
                key={scene.id}
                className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition duration-200"
              >
                {/* Scene Header & Thumbnail */}
                <div className="relative h-44 w-full bg-slate-900 group">
                  {scene.keyframeUrl ? (
                    <img
                      src={scene.keyframeUrl}
                      alt={scene.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-950/80">
                      <ImageIcon className="w-8 h-8 text-slate-700 mb-1" />
                      <span className="text-xs text-slate-500">No Keyframe Anchor</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-black/40" />

                  {/* Badges on top */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white text-xs font-bold shadow-md">
                      Scene {scene.order}
                    </span>
                    <Badge variant="cyan" size="sm">
                      {scene.durationSeconds}s
                    </Badge>
                  </div>

                  {/* Generate / Preview Keyframe button */}
                  <div className="absolute bottom-3 right-3">
                    <button
                      onClick={() =>
                        onGenerateKeyframe(
                          'scene',
                          scene.id,
                          scene.synthesizedPrompt || scene.visualDescription
                        )
                      }
                      disabled={isGeneratingKeyframe}
                      title="Generate Anchor Image for Image-to-Video"
                      className="px-2.5 py-1 bg-black/60 hover:bg-cyan-600 backdrop-blur-md rounded-md text-[11px] text-cyan-300 hover:text-white border border-white/10 transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{scene.keyframeUrl ? 'Regen Anchor' : 'Gen Anchor'}</span>
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-white line-clamp-1">
                      {scene.title}
                    </h4>

                    {/* Camera and Character Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <Badge variant="indigo" size="sm" className="flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        <span>{scene.cameraMovement.replace(/_/g, ' ')}</span>
                      </Badge>

                      {assignedChars.map((char) => (
                        <span
                          key={char.id}
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {char.name}
                        </span>
                      ))}
                    </div>

                    {/* Visual Description */}
                    <p className="mt-3 text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {scene.visualDescription}
                    </p>

                    {/* Script Narration */}
                    {scene.narration && (
                      <div className="mt-3 p-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="flex items-center gap-1">
                            <Mic className="w-3 h-3 text-cyan-400" />
                            <span>Voiceover (TTS)</span>
                          </span>
                          <span>~{estRead}s</span>
                        </div>
                        <p className="text-slate-200 italic line-clamp-2">"{scene.narration}"</p>
                      </div>
                    )}

                    {/* Synthesized Prompt Box */}
                    {scene.synthesizedPrompt ? (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-cyan-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Model-Ready Prompt</span>
                          </span>
                          <button
                            onClick={() => copyToClipboard(scene.synthesizedPrompt, scene.id)}
                            className="text-slate-400 hover:text-white transition flex items-center gap-1 text-[10px]"
                          >
                            {copiedPromptId === scene.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedPromptId === scene.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                          {scene.synthesizedPrompt}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 p-2 text-center rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-[11px] text-slate-500">
                        Click "Synthesize Model Prompts" above to build prompt
                      </div>
                    )}
                  </div>

                  {/* Actions & Reordering */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveScene(index, 'up')}
                        disabled={index === 0}
                        title="Move Scene Earlier"
                        className="p-1.5 text-slate-400 hover:text-white disabled:opacity-20 rounded-lg hover:bg-slate-800 transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveScene(index, 'down')}
                        disabled={index === project.scenes.length - 1}
                        title="Move Scene Later"
                        className="p-1.5 text-slate-400 hover:text-white disabled:opacity-20 rounded-lg hover:bg-slate-800 transition"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedScene(scene);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-slate-800 transition"
                        title="Edit Scene"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteScene(scene.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                        title="Delete Scene"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141E33] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Scene & Title</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Camera Motion</th>
                  <th className="py-3 px-4">Characters</th>
                  <th className="py-3 px-4">Script Narration</th>
                  <th className="py-3 px-4">Keyframe Anchor</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {project.scenes.map((scene, index) => {
                  const assignedChars = project.characters.filter((c) =>
                    scene.characterIds.includes(c.id)
                  );

                  return (
                    <tr key={scene.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-bold text-white">#{scene.order}</td>
                      <td className="py-3 px-4 font-semibold text-white max-w-[180px] truncate">
                        {scene.title}
                      </td>
                      <td className="py-3 px-4">{scene.durationSeconds}s</td>
                      <td className="py-3 px-4">
                        <Badge variant="indigo" size="sm">
                          {scene.cameraMovement}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {assignedChars.map((c) => (
                            <span
                              key={c.id}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-[200px] truncate italic text-slate-400">
                        {scene.narration || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {scene.keyframeUrl ? (
                          <img
                            src={scene.keyframeUrl}
                            alt=""
                            className="w-10 h-7 object-cover rounded border border-slate-700"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-500">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedScene(scene);
                              setIsModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-cyan-300"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteScene(scene.id)}
                            className="p-1 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scene Modal */}
      <SceneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveScene}
        initialScene={selectedScene}
        characters={project.characters}
        projectId={project.id}
        nextOrder={project.scenes.length + 1}
      />
    </div>
  );
};
