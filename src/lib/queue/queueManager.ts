import fs from 'fs';
import path from 'path';
import { GenerationJob, JobStatus, Take, VideoGenerationRequest } from '@/types';
import { generateId } from '@/lib/utils';
import { getProjectById, saveProject } from '@/lib/storage';
import { getProviderAdapter } from '@/lib/providers/registry';
import { normalizeVideoClip } from '@/lib/ffmpeg/normalizer';

const DATA_DIR = path.join(process.cwd(), 'data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const MEDIA_RAW_DIR = path.join(DATA_DIR, 'media', 'raw');
const MEDIA_NORM_DIR = path.join(DATA_DIR, 'media', 'normalized');

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(MEDIA_RAW_DIR)) fs.mkdirSync(MEDIA_RAW_DIR, { recursive: true });
  if (!fs.existsSync(MEDIA_NORM_DIR)) fs.mkdirSync(MEDIA_NORM_DIR, { recursive: true });
}

export class QueueManager {
  private static instance: QueueManager;
  private jobs: Map<string, GenerationJob> = new Map();
  private isProcessing = false;
  private maxConcurrency = 2;
  private activeJobsCount = 0;

  private constructor() {
    ensureDirectories();
    this.loadJobs();
  }

  public static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  private loadJobs() {
    try {
      if (fs.existsSync(JOBS_FILE)) {
        const raw = fs.readFileSync(JOBS_FILE, 'utf-8');
        const list = JSON.parse(raw) as GenerationJob[];
        list.forEach((j) => this.jobs.set(j.id, j));
      }
    } catch (err) {
      console.error('Failed to load jobs file:', err);
    }
  }

  private saveJobs() {
    try {
      ensureDirectories();
      const list = Array.from(this.jobs.values());
      fs.writeFileSync(JOBS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save jobs file:', err);
    }
  }

  public getJob(id: string): GenerationJob | undefined {
    return this.jobs.get(id);
  }

  public getJobsByProject(projectId: string): GenerationJob[] {
    return Array.from(this.jobs.values())
      .filter((j) => j.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async enqueueSceneJob({
    projectId,
    sceneId,
    providerId = 'runway',
  }: {
    projectId: string;
    sceneId: string;
    providerId?: string;
  }): Promise<GenerationJob> {
    const project = getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const scene = project.scenes.find((s) => s.id === sceneId);
    if (!scene) throw new Error('Scene not found');

    // Calculate take number
    const currentTakes = scene.takes || [];
    const takeNumber = currentTakes.length + 1;

    // Build unified generation request
    const request: VideoGenerationRequest = {
      prompt: scene.synthesizedPrompt || scene.visualDescription,
      negativePrompt: project.continuityRules.negativeConstraints,
      referenceImages: [
        ...(scene.keyframeUrl ? [{ url: scene.keyframeUrl, role: 'first_frame' as const }] : []),
        ...project.characters
          .filter((c) => scene.characterIds.includes(c.id) && c.referenceKeyframeUrl)
          .map((c) => ({ url: c.referenceKeyframeUrl!, role: 'character_ref' as const })),
      ],
      durationSeconds: scene.durationSeconds || 5,
      aspectRatio: project.aspectRatio,
      resolution: project.resolution,
      cameraMovement: scene.cameraMovement,
    };

    const jobId = generateId('job');
    const job: GenerationJob = {
      id: jobId,
      projectId,
      sceneId,
      providerId,
      status: 'queued',
      progressPercent: 0,
      stageDescription: 'Queued in worker dispatch pipeline',
      takeNumber,
      request,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.jobs.set(job.id, job);
    this.saveJobs();

    // Trigger processing
    this.triggerWorker();

    return job;
  }

  public async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === 'completed' || job.status === 'failed') return false;

    job.status = 'cancelled';
    job.stageDescription = 'Job cancelled by user';
    job.updatedAt = new Date().toISOString();
    this.saveJobs();

    if (job.providerJobId) {
      const adapter = getProviderAdapter(job.providerId);
      if (adapter.cancel) await adapter.cancel(job.providerJobId);
    }

    return true;
  }

  private triggerWorker() {
    if (this.isProcessing) return;
    this.processNextJobs();
  }

  private async processNextJobs() {
    this.isProcessing = true;

    try {
      while (this.activeJobsCount < this.maxConcurrency) {
        const nextJob = Array.from(this.jobs.values()).find((j) => j.status === 'queued');
        if (!nextJob) break;

        this.activeJobsCount++;
        // Process asynchronously without blocking the loop
        this.executeJob(nextJob).finally(() => {
          this.activeJobsCount--;
          this.processNextJobs();
        });
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async executeJob(job: GenerationJob) {
    try {
      const adapter = getProviderAdapter(job.providerId);

      // 1. Dispatch to Provider Adapter
      job.status = 'generating';
      job.stageDescription = `Dispatching request to ${adapter.name}...`;
      job.progressPercent = 10;
      job.updatedAt = new Date().toISOString();
      this.saveJobs();

      const { providerJobId } = await adapter.submit(job.request);
      job.providerJobId = providerJobId;
      job.stageDescription = `Generating video clip on ${adapter.name}...`;
      this.saveJobs();

      // 2. Poll for provider completion
      let isDone = false;
      let rawClipUrl = '';

      while (!isDone) {
        // Check if job was cancelled
        const current = this.jobs.get(job.id);
        if (current?.status === 'cancelled') return;

        await new Promise((r) => setTimeout(r, 1000));
        const status = await adapter.getStatus(providerJobId);

        if (status.status === 'completed' && status.videoUrl) {
          isDone = true;
          rawClipUrl = status.videoUrl;
          job.progressPercent = 65;
        } else if (status.status === 'failed') {
          throw new Error(status.errorMessage || 'Provider generation failed');
        } else {
          // Scale generation progress into 10% - 65%
          const scaled = 10 + Math.round((status.progressPercent / 100) * 55);
          job.progressPercent = Math.min(65, scaled);
          job.stageDescription = `Generating clip (${status.progressPercent}%)...`;
          job.updatedAt = new Date().toISOString();
          this.saveJobs();
        }
      }

      // 3. Clip Ingestion (Stage 7)
      job.status = 'ingesting';
      job.stageDescription = 'Ingesting raw generated video take to storage volume...';
      job.progressPercent = 70;
      job.updatedAt = new Date().toISOString();
      this.saveJobs();

      const rawFileName = `raw_${job.id}.mp4`;
      const rawFilePath = path.join(MEDIA_RAW_DIR, rawFileName);

      // If rawClipUrl is local relative URL or remote, handle download or copy
      if (rawClipUrl.startsWith('/api/media/raw/')) {
        const existingLocalName = rawClipUrl.replace('/api/media/raw/', '');
        const existingLocalPath = path.join(MEDIA_RAW_DIR, existingLocalName);
        if (fs.existsSync(existingLocalPath) && existingLocalPath !== rawFilePath) {
          fs.copyFileSync(existingLocalPath, rawFilePath);
        }
      } else if (rawClipUrl.startsWith('http')) {
        // Download from remote provider
        const resp = await fetch(rawClipUrl);
        const arrayBuffer = await resp.arrayBuffer();
        fs.writeFileSync(rawFilePath, Buffer.from(arrayBuffer));
      }

      job.rawVideoUrl = `/api/media/raw/${rawFileName}`;

      // 4. Clip Normalization (Stage 8)
      job.status = 'normalizing';
      job.stageDescription = 'Running FFmpeg normalization filter (30fps, yuv420p, 48kHz audio, +faststart)...';
      job.progressPercent = 80;
      job.updatedAt = new Date().toISOString();
      this.saveJobs();

      const normFileName = `norm_${job.id}.mp4`;
      const normFilePath = path.join(MEDIA_NORM_DIR, normFileName);

      const { metadata } = await normalizeVideoClip({
        inputPath: rawFilePath,
        outputPath: normFilePath,
        aspectRatio: job.request.aspectRatio,
        durationSeconds: job.request.durationSeconds,
        onProgress: (p) => {
          job.progressPercent = 80 + Math.round((p / 100) * 15);
          this.saveJobs();
        },
      });

      job.normalizedVideoUrl = `/api/media/normalized/${normFileName}`;

      // 5. Create durable Take record and associate to Scene
      const project = getProjectById(job.projectId);
      if (project) {
        const sceneIndex = project.scenes.findIndex((s) => s.id === job.sceneId);
        if (sceneIndex >= 0) {
          const takeId = generateId('take');
          const newTake: Take = {
            id: takeId,
            sceneId: job.sceneId,
            takeNumber: job.takeNumber,
            providerId: job.providerId,
            prompt: job.request.prompt,
            rawVideoUrl: job.rawVideoUrl,
            normalizedVideoUrl: job.normalizedVideoUrl,
            durationSeconds: metadata.durationSeconds,
            aspectRatio: job.request.aspectRatio,
            resolution: job.request.resolution || '1080p',
            fps: metadata.fps,
            pixelFormat: metadata.pixelFormat,
            audioSampleRate: metadata.audioSampleRate,
            codec: metadata.codec,
            status: 'ready',
            createdAt: new Date().toISOString(),
          };

          const scene = project.scenes[sceneIndex];
          scene.takes = scene.takes || [];
          scene.takes.push(newTake);
          scene.activeTakeId = newTake.id;
          scene.status = 'rendered';

          saveProject(project);
        }
      }

      // 6. Complete Job
      job.status = 'completed';
      job.stageDescription = 'Take normalized & ready for timeline assembly';
      job.progressPercent = 100;
      job.updatedAt = new Date().toISOString();
      this.saveJobs();
    } catch (err: any) {
      console.error(`Job ${job.id} failed:`, err);
      job.status = 'failed';
      job.stageDescription = `Error: ${err.message}`;
      job.errorMessage = err.message;
      job.updatedAt = new Date().toISOString();
      this.saveJobs();
    }
  }
}

export const queueManager = QueueManager.getInstance();
