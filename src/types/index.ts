// Architecture Schema & Unified Types for AI Video Creation Platform

export type AspectRatio = '16:9' | '9:16' | '1:1';
export type Resolution = '720p' | '1080p';

export type CameraMovement = 
  | 'static'
  | 'dolly_in'
  | 'dolly_out'
  | 'pan_left'
  | 'pan_right'
  | 'crane_down'
  | 'hero_low_angle'
  | 'orbital_spin'
  | 'handheld_dynamic';

export type TransitionType = 'cut' | 'dissolve' | 'fade_black';

export interface CharacterProfile {
  id: string;
  projectId: string;
  name: string;
  role: 'Protagonist' | 'Antagonist' | 'Supporting' | 'Narrator';
  visualSummary: string; // e.g. "Early 30s detective, razor-sharp jawline, silver-flecked black hair, tired grey eyes"
  attireTokens: string; // e.g. "Charcoal distressed wool trenchcoat over high-collar carbon-fiber weave vest, fingerless gloves"
  distinguishingFeatures: string; // e.g. "Cybernetic neural jack behind right ear, thin combat scar over left eyebrow"
  referenceKeyframeUrl?: string; // Anchor image URL for Image-to-Video
  voiceTone?: string; // Voice attributes for TTS
  voiceId?: string; // ElevenLabs or TTS voice identifier
  colorKey?: string; // Badge color
}

export interface ContinuityRules {
  lighting: string; // e.g. "Moody high-contrast volumetric neon cyan & magenta rim light"
  cameraLensStyle: string; // e.g. "35mm anamorphic lens, shallow depth of field, natural film grain"
  colorPalette: string; // e.g. "Teal, deep charcoal, neon amber accents"
  environmentTokens: string; // e.g. "Rain-slicked asphalt, holographic billboards, steam vents"
  negativeConstraints: string; // e.g. "cartoonish, 3d render plastic sheen, warped hands, watermark, blurry"
}

export interface CreativeBrief {
  logline?: string;
  narrativeHook?: string;
  visualTone?: string;
  pacing?: string;
  keyThemes?: string[];
  musicAtmosphere?: string;
}

export interface TakeTrimming {
  inPointSeconds: number; // Start trim (seconds)
  outPointSeconds: number; // End trim (seconds)
}

export interface Take {
  id: string;
  sceneId: string;
  takeNumber: number;
  providerId: string;
  prompt: string;
  rawVideoUrl: string;
  normalizedVideoUrl: string;
  durationSeconds: number;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  fps: number; // 30
  pixelFormat: string; // 'yuv420p'
  audioSampleRate: number; // 48000
  codec: string; // 'h264'
  status: 'ready' | 'processing' | 'failed';
  trimming?: TakeTrimming;
  createdAt: string;
}

export interface SceneAudio {
  voiceoverUrl?: string;
  durationSeconds?: number;
  timestamps?: Array<{ word: string; startMs: number; endMs: number }>;
  status?: 'none' | 'generating' | 'ready';
}

export interface Scene {
  id: string;
  projectId: string;
  order: number;
  title: string;
  durationSeconds: number; // default 5s
  narration: string; // Voiceover line for TTS
  characterIds: string[]; // Linked CharacterProfile IDs
  visualDescription: string; // Core action & subject
  cameraMovement: CameraMovement;
  lightingAndAtmosphere?: string;
  synthesizedPrompt: string; // Auto-generated model-ready prompt combining tokens + camera + action
  keyframeUrl?: string; // Visual reference anchor for Image-to-Video
  keyframeStatus?: 'none' | 'generating' | 'ready';
  status: 'draft' | 'prompt_ready' | 'keyframe_ready' | 'rendered';
  notes?: string;
  preferredProviderId?: string; // Phase 4 provider selection
  takes?: Take[];
  activeTakeId?: string;
  voiceoverUrl?: string;
  voiceoverDuration?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedScenes?: Partial<Scene>[];
  suggestedBrief?: Partial<CreativeBrief>;
}

export interface TimelineSettings {
  transitionType: TransitionType;
  transitionDurationSeconds: number; // e.g. 0.5s
  includeVoiceover: boolean;
  includeMusic: boolean;
  selectedMusicId: string;
  musicVolume: number; // 0.0 - 1.0 (default 0.25)
  duckingIntensity: number; // 0.0 - 1.0 (default 0.70)
  burnSubtitles: boolean;
  subtitleStyle: 'cinematic' | 'minimal' | 'bold';
}

export interface MusicTrack {
  id: string;
  title: string;
  genre: string;
  tempo: string;
  mood: string;
  audioUrl: string;
  durationSeconds: number;
}

export interface ProviderBenchmark {
  id: string;
  name: string;
  company: string;
  costPerSecond: number;
  avgTurnaroundSeconds: number;
  qualityScore: number; // 1-10
  consistencyScore: number; // 1-10
  bestFor: string;
  strengths: string[];
}

export interface Project {
  id: string;
  title: string;
  concept: string;
  targetDurationSeconds: number; // 15, 30, 60
  aspectRatio: AspectRatio;
  resolution: Resolution;
  visualGenre: string;
  targetAudience: string;
  creativeBrief: CreativeBrief;
  continuityRules: ContinuityRules;
  characters: CharacterProfile[];
  scenes: Scene[];
  brainstormMessages: ChatMessage[];
  timelineSettings?: TimelineSettings;
  masterExportUrl?: string;
  masterSubtitlesUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Unified Provider Adapter Interface (Matches architecture section 4)
export interface VideoGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  referenceImages?: Array<{
    url: string;
    role: 'first_frame' | 'character_ref' | 'style_ref';
  }>;
  durationSeconds: number;
  aspectRatio: AspectRatio;
  resolution?: Resolution;
  seed?: number;
  motionIntensity?: number;
  cameraMovement?: CameraMovement;
}

export interface VideoProviderAdapter {
  readonly id: string;
  readonly name: string;
  readonly capabilities: {
    supportsImageToVideo: boolean;
    supportsCameraMotion: boolean;
    supportedAspectRatios: string[];
    maxDurationSeconds: number;
  };

  submit(request: VideoGenerationRequest): Promise<{ providerJobId: string; status: 'queued' | 'processing' }>;
  getStatus(providerJobId: string): Promise<{
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progressPercent: number;
    videoUrl?: string;
    errorMessage?: string;
  }>;
  cancel?(providerJobId: string): Promise<boolean>;
}

export type JobStatus =
  | 'queued'
  | 'generating'
  | 'ingesting'
  | 'normalizing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface GenerationJob {
  id: string;
  projectId: string;
  sceneId: string;
  providerId: string;
  providerJobId?: string;
  status: JobStatus;
  progressPercent: number;
  stageDescription: string;
  takeNumber: number;
  request: VideoGenerationRequest;
  rawVideoUrl?: string;
  normalizedVideoUrl?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export type AssemblyStatus =
  | 'queued'
  | 'rendering_tts'
  | 'generating_subtitles'
  | 'mixing_audio'
  | 'stitching_timeline'
  | 'completed'
  | 'failed';

export interface AssemblyJob {
  id: string;
  projectId: string;
  status: AssemblyStatus;
  progressPercent: number;
  stageDescription: string;
  masterVideoUrl?: string;
  subtitleUrl?: string;
  settings: TimelineSettings;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KeyframeGenerationRequest {
  prompt: string;
  aspectRatio: AspectRatio;
  stylePreset?: string;
  targetType: 'character' | 'scene';
  targetId: string;
}
