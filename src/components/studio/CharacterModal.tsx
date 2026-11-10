'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CharacterProfile } from '@/types';
import { generateId } from '@/lib/utils';
import { Sparkles, UserCheck } from 'lucide-react';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: CharacterProfile) => Promise<void>;
  initialCharacter?: CharacterProfile | null;
  projectId: string;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCharacter,
  projectId,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<CharacterProfile['role']>('Protagonist');
  const [visualSummary, setVisualSummary] = useState('');
  const [attireTokens, setAttireTokens] = useState('');
  const [distinguishingFeatures, setDistinguishingFeatures] = useState('');
  const [voiceTone, setVoiceTone] = useState('');
  const [referenceKeyframeUrl, setReferenceKeyframeUrl] = useState('');
  const [colorKey, setColorKey] = useState('#06B6D4');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialCharacter) {
      setName(initialCharacter.name);
      setRole(initialCharacter.role);
      setVisualSummary(initialCharacter.visualSummary);
      setAttireTokens(initialCharacter.attireTokens);
      setDistinguishingFeatures(initialCharacter.distinguishingFeatures);
      setVoiceTone(initialCharacter.voiceTone || '');
      setReferenceKeyframeUrl(initialCharacter.referenceKeyframeUrl || '');
      setColorKey(initialCharacter.colorKey || '#06B6D4');
    } else {
      setName('');
      setRole('Protagonist');
      setVisualSummary('');
      setAttireTokens('');
      setDistinguishingFeatures('');
      setVoiceTone('');
      setReferenceKeyframeUrl('');
      setColorKey('#06B6D4');
    }
  }, [initialCharacter, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      const character: CharacterProfile = {
        id: initialCharacter?.id || generateId('char'),
        projectId,
        name,
        role,
        visualSummary,
        attireTokens,
        distinguishingFeatures,
        voiceTone,
        referenceKeyframeUrl: referenceKeyframeUrl.trim() || undefined,
        colorKey,
      };

      await onSave(character);
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
      title={initialCharacter ? 'Edit Character Profile' : 'Register New Character'}
      description="Define strict visual tokens and attire descriptions to prevent aesthetic and facial drift across video scenes."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Character Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jax Vance"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Narrative Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white"
            >
              <option value="Protagonist">Protagonist</option>
              <option value="Antagonist">Antagonist</option>
              <option value="Supporting">Supporting</option>
              <option value="Narrator">Narrator</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Physical Appearance & Facial Features (Visual Summary)
          </label>
          <textarea
            rows={2}
            value={visualSummary}
            onChange={(e) => setVisualSummary(e.target.value)}
            placeholder="e.g. Early 30s detective, razor-sharp jawline, tired steel-grey eyes, slicked-back jet-black hair with silver temples"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Persistent Wardrobe & Attire Tokens
          </label>
          <textarea
            rows={2}
            value={attireTokens}
            onChange={(e) => setAttireTokens(e.target.value)}
            placeholder="e.g. Charcoal distressed wool trenchcoat over high-collar carbon-fiber vest, tactical gloves, holster"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Distinguishing Identifiers
            </label>
            <input
              type="text"
              value={distinguishingFeatures}
              onChange={(e) => setDistinguishingFeatures(e.target.value)}
              placeholder="e.g. Glowing cyan neural port behind right ear, eyebrow scar"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Voiceover Tone (for TTS)
            </label>
            <input
              type="text"
              value={voiceTone}
              onChange={(e) => setVoiceTone(e.target.value)}
              placeholder="e.g. Deep raspy baritone, measured cadence"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Reference Keyframe Image URL (Visual Anchor)
          </label>
          <input
            type="url"
            value={referenceKeyframeUrl}
            onChange={(e) => setReferenceKeyframeUrl(e.target.value)}
            placeholder="https://... or generate one using the Keyframe Studio"
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
            leftIcon={<UserCheck className="w-4 h-4" />}
          >
            {initialCharacter ? 'Update Character' : 'Save Character'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
