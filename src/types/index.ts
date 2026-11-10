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

export interface CharacterProfile {
  id: string;
  projectId: string;
  name: string;
  role: 'Protagonist' | 'Antagonist' | 'Supporting' | 'Narrator';
  visualSummary: string; // e.g. "Early 30s detective, rugged jawline, silver-flecked black hair, tired grey eyes"
  attireTokens: string; // e.g. "Charcoal distressed wool trench coat, dark turtleneck, fingerless gloves"
  distinguishingFeatures: string; // e.g. "Cybernetic neural jack behind right ear, thin scar over left brow"
  referenceKeyframeUrl?: string; // Anchor image URL for Image-to-Video
  voiceTone?: string; // Voice attributes for TTS
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
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedScenes?: Partial<Scene>[];
  suggestedBrief?: Partial<CreativeBrief>;
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

export interface KeyframeGenerationRequest {
  prompt: string;
  aspectRatio: AspectRatio;
  stylePreset?: string;
  targetType: 'character' | 'scene';
  targetId: string;
}
