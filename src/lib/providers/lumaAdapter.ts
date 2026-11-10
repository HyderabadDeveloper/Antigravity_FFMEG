import { VideoProviderAdapter, VideoGenerationRequest } from '@/types';
import { generateId } from '@/lib/utils';
import { generateSyntheticClip } from '@/lib/ffmpeg/normalizer';
import path from 'path';

interface SimulatedTask {
  id: string;
  request: VideoGenerationRequest;
  createdAt: number;
  durationMs: number;
  videoUrl?: string;
}

const simulatedTasks = new Map<string, SimulatedTask>();

export class LumaDreamMachineAdapter implements VideoProviderAdapter {
  readonly id = 'luma';
  readonly name = 'Luma Dream Machine (Ray-2)';
  readonly capabilities = {
    supportsImageToVideo: true,
    supportsCameraMotion: true,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    maxDurationSeconds: 5,
  };

  private apiKey?: string;

  constructor() {
    this.apiKey = process.env.LUMA_API_KEY;
  }

  async submit(
    request: VideoGenerationRequest
  ): Promise<{ providerJobId: string; status: 'queued' | 'processing' }> {
    const providerJobId = generateId('luma_task');
    const simTask: SimulatedTask = {
      id: providerJobId,
      request,
      createdAt: Date.now(),
      durationMs: 6000, // Fast turnaround
    };
    simulatedTasks.set(providerJobId, simTask);

    return { providerJobId, status: 'queued' };
  }

  async getStatus(providerJobId: string): Promise<{
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progressPercent: number;
    videoUrl?: string;
    errorMessage?: string;
  }> {
    const task = simulatedTasks.get(providerJobId);
    if (!task) {
      return { status: 'failed', progressPercent: 0, errorMessage: 'Task not found' };
    }

    const elapsed = Date.now() - task.createdAt;
    const progressPercent = Math.min(100, Math.round((elapsed / task.durationMs) * 100));

    if (elapsed >= task.durationMs) {
      if (!task.videoUrl) {
        const rawMediaDir = path.join(process.cwd(), 'data', 'media', 'raw');
        const rawFile = path.join(rawMediaDir, `${providerJobId}.mp4`);
        await generateSyntheticClip({
          outputPath: rawFile,
          durationSeconds: task.request.durationSeconds || 5,
          title: `Luma: ${task.request.prompt.slice(0, 30)}`,
          aspectRatio: task.request.aspectRatio,
        });
        task.videoUrl = `/api/media/raw/${providerJobId}.mp4`;
      }

      return {
        status: 'completed',
        progressPercent: 100,
        videoUrl: task.videoUrl,
      };
    }

    return {
      status: elapsed > 1000 ? 'processing' : 'queued',
      progressPercent,
    };
  }

  async cancel(providerJobId: string): Promise<boolean> {
    if (simulatedTasks.has(providerJobId)) {
      simulatedTasks.delete(providerJobId);
      return true;
    }
    return true;
  }
}
