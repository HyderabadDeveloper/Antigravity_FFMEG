'use client';

import React, { useState } from 'react';
import { Project, CreativeBrief } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Save, Check, Sparkles, Film, Music, ShieldAlert } from 'lucide-react';

interface IntakeConceptTabProps {
  project: Project;
  onUpdateProject: (updates: Partial<Project>) => Promise<void>;
}

export const IntakeConceptTab: React.FC<IntakeConceptTabProps> = ({
  project,
  onUpdateProject,
}) => {
  const [title, setTitle] = useState(project.title);
  const [concept, setConcept] = useState(project.concept);
  const [targetAudience, setTargetAudience] = useState(project.targetAudience);
  const [brief, setBrief] = useState<CreativeBrief>(project.creativeBrief || {});
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onUpdateProject({
        title,
        concept,
        targetAudience,
        creativeBrief: brief,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner Overview */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="cyan">Stage 1</Badge>
              <h2 className="text-xl font-bold text-white">Creative Brief & Narrative Intake</h2>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              The foundational premise and parameters that guide the LLM brainstorm, character sheets, and scene synthesis.
            </p>
          </div>

          <Button
            type="submit"
            variant={savedSuccess ? 'neon' : 'primary'}
            isLoading={isSaving}
            leftIcon={savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          >
            {savedSuccess ? 'Saved' : 'Save Brief'}
          </Button>
        </div>

        {/* Core Project Identifiers */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Audience
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Initial Narrative Premise / Core Idea
          </label>
          <textarea
            rows={3}
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white"
          />
        </div>
      </div>

      {/* Structured Creative Brief */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Director's Creative Brief</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Cinematic Logline
            </label>
            <textarea
              rows={2}
              value={brief.logline || ''}
              onChange={(e) => setBrief({ ...brief, logline: e.target.value })}
              placeholder="A one-sentence summary capturing protagonist, conflict, and stakes..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Opening Narrative Hook
            </label>
            <textarea
              rows={2}
              value={brief.narrativeHook || ''}
              onChange={(e) => setBrief({ ...brief, narrativeHook: e.target.value })}
              placeholder="The visual or auditory beat in the first 3 seconds that grabs the audience..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-indigo-400" />
              <span>Visual Tone & Mood</span>
            </label>
            <input
              type="text"
              value={brief.visualTone || ''}
              onChange={(e) => setBrief({ ...brief, visualTone: e.target.value })}
              placeholder="e.g. Gritty, melancholic, hyper-stylized chiaroscuro"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Pacing & Rhythm
            </label>
            <input
              type="text"
              value={brief.pacing || ''}
              onChange={(e) => setBrief({ ...brief, pacing: e.target.value })}
              placeholder="e.g. Fast kinetic cuts, slow deliberate atmospheric build"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-cyan-400" />
            <span>Music & Sonic Atmosphere (Target for Phase 3 Audio)</span>
          </label>
          <input
            type="text"
            value={brief.musicAtmosphere || ''}
            onChange={(e) => setBrief({ ...brief, musicAtmosphere: e.target.value })}
            placeholder="e.g. Heavy analog sub-bass synthesizer, distant sirens, binaural rain foley"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 focus:border-indigo-500 text-sm text-white placeholder-slate-600"
          />
        </div>
      </div>
    </form>
  );
};
