'use client';

import React, { useState } from 'react';
import { Project, CharacterProfile, ContinuityRules } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CharacterModal } from './CharacterModal';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Camera,
  Sun,
  Palette,
  ShieldAlert,
  Sparkles,
  Save,
  Check,
  ImageIcon,
} from 'lucide-react';

interface ContinuityTabProps {
  project: Project;
  onUpdateProject: (updates: Partial<Project>) => Promise<void>;
  onGenerateKeyframe: (
    targetType: 'character' | 'scene',
    targetId: string,
    prompt: string
  ) => Promise<void>;
  isGeneratingKeyframe: boolean;
}

export const ContinuityTab: React.FC<ContinuityTabProps> = ({
  project,
  onUpdateProject,
  onGenerateKeyframe,
  isGeneratingKeyframe,
}) => {
  const [rules, setRules] = useState<ContinuityRules>(
    project.continuityRules || {
      lighting: '',
      cameraLensStyle: '',
      colorPalette: '',
      environmentTokens: '',
      negativeConstraints: '',
    }
  );
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingRules, setIsSavingRules] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingRules(true);
      await onUpdateProject({ continuityRules: rules });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingRules(false);
    }
  };

  const handleSaveCharacter = async (char: CharacterProfile) => {
    const existingIndex = project.characters.findIndex((c) => c.id === char.id);
    let updatedChars = [...project.characters];

    if (existingIndex >= 0) {
      updatedChars[existingIndex] = char;
    } else {
      updatedChars.push(char);
    }

    await onUpdateProject({ characters: updatedChars });
  };

  const handleDeleteCharacter = async (charId: string) => {
    if (!confirm('Are you sure you want to delete this character?')) return;
    const updatedChars = project.characters.filter((c) => c.id !== charId);
    await onUpdateProject({ characters: updatedChars });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan">Stage 3</Badge>
            <h2 className="text-xl font-bold text-white">Visual Continuity & Character Engine</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Define persistent character profiles and universal lighting/lens tokens to anchor AI video generation and eliminate aesthetic drift.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setSelectedCharacter(null);
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Character Profile
        </Button>
      </div>

      {/* Characters Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">
              Character Profiles & Visual Anchors ({project.characters.length})
            </h3>
          </div>
        </div>

        {project.characters.length === 0 ? (
          <div className="p-8 text-center bg-[#111827] border border-dashed border-slate-800 rounded-2xl">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">No characters registered yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Register key characters with detailed visual tokens to anchor Image-to-Video models.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCharacter(null);
                setIsModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add First Character
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {project.characters.map((char) => {
              const charPrompt = `${char.name}, ${char.visualSummary}, wearing ${char.attireTokens}, ${char.distinguishingFeatures}, ${project.continuityRules.lighting}, 8k portrait, masterpiece`;

              return (
                <div
                  key={char.id}
                  className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition flex flex-col justify-between"
                >
                  {/* Portrait / Keyframe Preview */}
                  <div className="relative h-48 w-full bg-slate-900 group">
                    {char.referenceKeyframeUrl ? (
                      <img
                        src={char.referenceKeyframeUrl}
                        alt={char.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-950/60">
                        <ImageIcon className="w-8 h-8 text-slate-700 mb-1" />
                        <span className="text-xs text-slate-500">No Reference Keyframe</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <Badge variant="indigo" size="sm">
                        {char.role}
                      </Badge>
                      <button
                        onClick={() =>
                          onGenerateKeyframe('character', char.id, charPrompt)
                        }
                        disabled={isGeneratingKeyframe}
                        title="Generate Reference Anchor"
                        className="px-2 py-1 bg-black/60 hover:bg-indigo-600 backdrop-blur-md rounded-md text-[11px] text-cyan-300 hover:text-white border border-white/10 transition flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Gen Anchor</span>
                      </button>
                    </div>
                  </div>

                  {/* Character Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span>{char.name}</span>
                      </h4>
                      <p className="mt-1 text-xs text-slate-300 line-clamp-2">
                        {char.visualSummary}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="text-slate-400">
                        <span className="font-semibold text-slate-300">Wardrobe: </span>
                        <span className="line-clamp-2">{char.attireTokens || 'Not specified'}</span>
                      </div>
                      {char.distinguishingFeatures && (
                        <div className="text-slate-400">
                          <span className="font-semibold text-slate-300">Marks: </span>
                          <span className="line-clamp-1">{char.distinguishingFeatures}</span>
                        </div>
                      )}
                      {char.voiceTone && (
                        <div className="text-slate-400">
                          <span className="font-semibold text-slate-300">Voice: </span>
                          <span className="line-clamp-1 italic">{char.voiceTone}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedCharacter(char);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-slate-800 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCharacter(char.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Universal Continuity Rules Form */}
      <form
        onSubmit={handleSaveRules}
        className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">
              Master Cinematic & Environment Tokens
            </h3>
          </div>

          <Button
            type="submit"
            variant={savedSuccess ? 'neon' : 'primary'}
            isLoading={isSavingRules}
            leftIcon={savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          >
            {savedSuccess ? 'Rules Saved' : 'Save Continuity Rules'}
          </Button>
        </div>

        <p className="text-xs text-slate-400">
          These tokens are automatically injected into every scene prompt to preserve identical lighting, color palette, and lens properties across generation cuts.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Universal Lighting Rules</span>
            </label>
            <textarea
              rows={2}
              value={rules.lighting}
              onChange={(e) => setRules({ ...rules, lighting: e.target.value })}
              placeholder="e.g. Volumetric moody cyan and magenta rim light, heavy dark chiaroscuro shadows"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>Camera Lens & Style Specification</span>
            </label>
            <textarea
              rows={2}
              value={rules.cameraLensStyle}
              onChange={(e) => setRules({ ...rules, cameraLensStyle: e.target.value })}
              placeholder="e.g. 35mm anamorphic prime lens, shallow depth of field f/1.8, natural film grain"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-rose-400" />
              <span>Color Palette & Grade</span>
            </label>
            <input
              type="text"
              value={rules.colorPalette}
              onChange={(e) => setRules({ ...rules, colorPalette: e.target.value })}
              placeholder="e.g. Deep charcoal black, vibrant cyan, neon magenta, amber accents"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Environment Tokens
            </label>
            <input
              type="text"
              value={rules.environmentTokens}
              onChange={(e) => setRules({ ...rules, environmentTokens: e.target.value })}
              placeholder="e.g. Rain-slicked wet asphalt, towering holographic billboards, steam vents"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Negative Constraints (Artifact Prevention)</span>
          </label>
          <input
            type="text"
            value={rules.negativeConstraints}
            onChange={(e) => setRules({ ...rules, negativeConstraints: e.target.value })}
            placeholder="e.g. cartoonish, oversaturated 3D plastic, warped fingers, deformed limbs, watermark"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-600"
          />
        </div>
      </form>

      {/* Character Modal */}
      <CharacterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCharacter}
        initialCharacter={selectedCharacter}
        projectId={project.id}
      />
    </div>
  );
};
