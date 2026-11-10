'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AspectRatio } from '@/types';
import { Sparkles, Wand2 } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: any) => Promise<void>;
}

const GENRE_PRESETS = [
  'Cinematic Photorealistic',
  'Sci-Fi Cyberpunk',
  'Anime / Studio Ghibli',
  'Dark Fantasy / Baroque',
  '3D Stylized Animation',
  'Vintage 1940s Film Noir',
  'Modern Luxury Commercial',
  'Documentary Hyperlapse',
];

const TEMPLATES = [
  {
    name: 'Cyberpunk Chase',
    title: 'Neon Pursuit: Sector 7',
    concept: 'A high-speed cybernetic bike chase through the rain-soaked lower levels of an overcrowded metropolis.',
    genre: 'Sci-Fi Cyberpunk',
    duration: 15,
    aspectRatio: '16:9' as AspectRatio,
  },
  {
    name: 'Luxury Fragrance',
    title: 'Aura: The Scent of Obsidian',
    concept: 'A surreal luxury perfume advertisement featuring liquid glass, black volcanic sand, and shimmering golden mist.',
    genre: 'Modern Luxury Commercial',
    duration: 15,
    aspectRatio: '9:16' as AspectRatio,
  },
  {
    name: 'Deep Sea Odyssey',
    title: 'Abyssal Genesis',
    concept: 'A deep-sea submersible discovers a massive bioluminescent leviathan hibernating beneath an ancient undersea trench.',
    genre: 'Cinematic Photorealistic',
    duration: 30,
    aspectRatio: '16:9' as AspectRatio,
  },
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [concept, setConcept] = useState('');
  const [targetDurationSeconds, setTargetDurationSeconds] = useState(15);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [visualGenre, setVisualGenre] = useState(GENRE_PRESETS[0]);
  const [targetAudience, setTargetAudience] = useState('Cinematic Storytelling Fans');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setConcept(tmpl.concept);
    setVisualGenre(tmpl.genre);
    setTargetDurationSeconds(tmpl.duration);
    setAspectRatio(tmpl.aspectRatio);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        title,
        concept,
        targetDurationSeconds,
        aspectRatio,
        visualGenre,
        targetAudience,
      });
      // Reset form
      setTitle('');
      setConcept('');
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
      title="Stage 1: Idea Intake & Project Setup"
      description="Define the creative vision, duration, and visual continuity constraints for your AI video production."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Quick Templates */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quick Starter Templates</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map((tmpl) => (
              <button
                type="button"
                key={tmpl.name}
                onClick={() => applyTemplate(tmpl)}
                className="text-left p-2.5 rounded-xl border border-slate-800 bg-[#0B0F19] hover:border-indigo-500/50 hover:bg-indigo-950/20 transition group"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                  {tmpl.name}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {tmpl.aspectRatio} • {tmpl.duration}s
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Project Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Project Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Neon Horizon: The Last Dispatch"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500"
          />
        </div>

        {/* Initial Concept / Prompt */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Core Concept / Narrative Prompt
          </label>
          <textarea
            rows={3}
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Describe the initial story premise, subject, or emotional journey..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500"
          />
        </div>

        {/* Runtime & Aspect Ratio */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Target Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 60].map((dur) => (
                <button
                  type="button"
                  key={dur}
                  onClick={() => setTargetDurationSeconds(dur)}
                  className={`py-2 text-xs font-medium rounded-lg border transition ${
                    targetDurationSeconds === dur
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-[#0B0F19] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['16:9', '9:16', '1:1'] as AspectRatio[]).map((ratio) => (
                <button
                  type="button"
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-2 text-xs font-medium rounded-lg border transition ${
                    aspectRatio === ratio
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                      : 'bg-[#0B0F19] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Genre & Audience */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Visual Style / Genre
            </label>
            <select
              value={visualGenre}
              onChange={(e) => setVisualGenre(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white"
            >
              {GENRE_PRESETS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Target Audience
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Sci-Fi fans, social media audience"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Wand2 className="w-4 h-4" />}
          >
            Create Video Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
