'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Scene, CharacterProfile, CameraMovement } from '@/types';
import { generateId, estimateWordReadingTimeSeconds } from '@/lib/utils';
import { Clapperboard, Video, Sparkles } from 'lucide-react';

interface SceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scene: Scene) => Promise<void>;
  initialScene?: Scene | null;
  characters: CharacterProfile[];
  projectId: string;
  nextOrder: number;
}

const CAMERA_OPTIONS: { value: CameraMovement; label: string }[] = [
  { value: 'static', label: 'Static Locked-off Frame' },
  { value: 'dolly_in', label: 'Slow Dolly In (Hero Push)' },
  { value: 'dolly_out', label: 'Slow Dolly Out (Reveal)' },
  { value: 'pan_left', label: 'Horizontal Pan Left' },
  { value: 'pan_right', label: 'Horizontal Pan Right' },
  { value: 'crane_down', label: 'Cinematic Crane Descend' },
  { value: 'hero_low_angle', label: 'Low-Angle Hero Shot' },
  { value: 'orbital_spin', label: '360° Orbital Pan' },
  { value: 'handheld_dynamic', label: 'Dynamic Handheld Motion' },
];

export const SceneModal: React.FC<SceneModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialScene,
  characters,
  projectId,
  nextOrder,
}) => {
  const [title, setTitle] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(5);
  const [narration, setNarration] = useState('');
  const [characterIds, setCharacterIds] = useState<string[]>([]);
  const [visualDescription, setVisualDescription] = useState('');
  const [cameraMovement, setCameraMovement] = useState<CameraMovement>('dolly_in');
  const [lightingAndAtmosphere, setLightingAndAtmosphere] = useState('');
  const [synthesizedPrompt, setSynthesizedPrompt] = useState('');
  const [keyframeUrl, setKeyframeUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialScene) {
      setTitle(initialScene.title);
      setDurationSeconds(initialScene.durationSeconds || 5);
      setNarration(initialScene.narration || '');
      setCharacterIds(initialScene.characterIds || []);
      setVisualDescription(initialScene.visualDescription || '');
      setCameraMovement(initialScene.cameraMovement || 'dolly_in');
      setLightingAndAtmosphere(initialScene.lightingAndAtmosphere || '');
      setSynthesizedPrompt(initialScene.synthesizedPrompt || '');
      setKeyframeUrl(initialScene.keyframeUrl || '');
    } else {
      setTitle(`Scene ${nextOrder}`);
      setDurationSeconds(5);
      setNarration('');
      setCharacterIds([]);
      setVisualDescription('');
      setCameraMovement('dolly_in');
      setLightingAndAtmosphere('');
      setSynthesizedPrompt('');
      setKeyframeUrl('');
    }
  }, [initialScene, isOpen, nextOrder]);

  const toggleCharacter = (charId: string) => {
    setCharacterIds((prev) =>
      prev.includes(charId) ? prev.filter((id) => id !== charId) : [...prev, charId]
    );
  };

  const readingTime = estimateWordReadingTimeSeconds(narration);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      const scene: Scene = {
        id: initialScene?.id || generateId('scene'),
        projectId,
        order: initialScene?.order || nextOrder,
        title,
        durationSeconds: Number(durationSeconds) || 5,
        narration,
        characterIds,
        visualDescription,
        cameraMovement,
        lightingAndAtmosphere: lightingAndAtmosphere.trim() || undefined,
        synthesizedPrompt,
        keyframeUrl: keyframeUrl.trim() || undefined,
        keyframeStatus: keyframeUrl.trim() ? 'ready' : 'none',
        status: initialScene?.status || 'draft',
      };

      await onSave(scene);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialScene ? `Edit Scene ${initialScene.order}: ${initialScene.title}` : `Create Scene ${nextOrder}`}
      description="Define the narration script, visual action, camera movement, and character presence for this take."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title, Duration, Camera */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Scene Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Neon Rain Descent"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Duration (Seconds)
            </label>
            <input
              type="number"
              min={3}
              max={15}
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white"
            />
          </div>
        </div>

        {/* Script / Narration with reading estimate */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Voiceover Script / Narration Line
            </label>
            {narration && (
              <span className="text-[11px] text-cyan-400">
                Est. TTS Reading: ~{readingTime}s ({durationSeconds >= readingTime ? 'Fits duration' : 'May exceed duration'})
              </span>
            )}
          </div>
          <textarea
            rows={2}
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            placeholder="e.g. In New Neo-Vegas, memories are the only currency that never loses value."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-600"
          />
        </div>

        {/* Characters Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Assigned Characters in Scene
          </label>
          {characters.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              No characters created yet. Add characters in the Continuity tab.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {characters.map((char) => {
                const isSelected = characterIds.includes(char.id);
                return (
                  <button
                    type="button"
                    key={char.id}
                    onClick={() => toggleCharacter(char.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                      isSelected
                        ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                        : 'bg-[#0B0F19] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {char.name} ({char.role})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Camera Choreography & Visual Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Camera Movement Choreography
            </label>
            <select
              value={cameraMovement}
              onChange={(e) => setCameraMovement(e.target.value as CameraMovement)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white"
            >
              {CAMERA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Scene-Specific Atmosphere Override
            </label>
            <input
              type="text"
              value={lightingAndAtmosphere}
              onChange={(e) => setLightingAndAtmosphere(e.target.value)}
              placeholder="e.g. Flickering crimson emergency lights"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Visual Description & Action
          </label>
          <textarea
            rows={2}
            value={visualDescription}
            onChange={(e) => setVisualDescription(e.target.value)}
            placeholder="e.g. Jax steps out of a dark alleyway onto a rain-slicked boulevard beneath towering holographic advertisements."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Keyframe Image URL (Anchor for Image-to-Video)
          </label>
          <input
            type="url"
            value={keyframeUrl}
            onChange={(e) => setKeyframeUrl(e.target.value)}
            placeholder="https://... or generate one in the Keyframe Studio"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-600"
          />
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Clapperboard className="w-4 h-4" />}
          >
            {initialScene ? 'Update Scene' : 'Add Scene'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
