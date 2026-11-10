'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '@/types';
import { Header } from '@/components/Header';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Plus,
  Clapperboard,
  Film,
  Users,
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  Cpu,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success && data.projects) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (projectData: any) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });
    const data = await res.json();
    if (data.success && data.project) {
      setProjects((prev) => [data.project, ...prev]);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.visualGenre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.concept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalScenes = projects.reduce((sum, p) => sum + p.scenes.length, 0);
  const totalCharacters = projects.reduce((sum, p) => sum + p.characters.length, 0);
  const totalKeyframes = projects.reduce(
    (sum, p) => sum + p.scenes.filter((s) => !!s.keyframeUrl).length,
    0
  );

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col text-slate-100">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#111827] via-[#0E1526] to-[#0A0E1A] border border-slate-800 p-8 sm:p-10 shadow-2xl overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="cyan">Phase 1 Architecture</Badge>
              <Badge variant="indigo">Continuity & Planning Engine</Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              AI Video Creation & Continuity Studio
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Eliminate aesthetic drift across cuts. Transform raw ideas into structured creative briefs, master character sheets, and anchored keyframe references ready for Google Veo and Runway Gen-3.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="w-5 h-5" />}
              >
                Create New Project
              </Button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="mt-8 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-2xl bg-[#0B0F19]/80 border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Active Projects</span>
              </div>
              <div className="text-2xl font-bold text-white">{projects.length}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0B0F19]/80 border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Film className="w-3.5 h-3.5 text-cyan-400" />
                <span>Scenes Planned</span>
              </div>
              <div className="text-2xl font-bold text-white">{totalScenes}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0B0F19]/80 border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Continuity Anchors</span>
              </div>
              <div className="text-2xl font-bold text-white">{totalCharacters}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0B0F19]/80 border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Keyframes Generated</span>
              </div>
              <div className="text-2xl font-bold text-white">{totalKeyframes}</div>
            </div>
          </div>
        </div>

        {/* Project Explorer Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Production Projects</h2>
            <span className="text-xs text-slate-400">({filteredProjects.length})</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects or genres..."
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[#111827] border border-slate-800 focus:border-indigo-500 text-xs text-white placeholder-slate-500"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              New Project
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading your production workspace...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center bg-[#111827] border border-dashed border-slate-800 rounded-2xl">
            <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No projects found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
              {searchQuery
                ? 'No projects matched your search query. Try clearing the filter.'
                : 'Create your first video project to begin creative intake and scene breakdown.'}
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Start New Video Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
