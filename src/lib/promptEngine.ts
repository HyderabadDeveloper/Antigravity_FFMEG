import { Scene, CharacterProfile, ContinuityRules, Project } from '@/types';

const CAMERA_DESCRIPTIONS: Record<string, string> = {
  static: 'locked-off stationary camera framing',
  dolly_in: 'smooth slow dolly-in push towards subject',
  dolly_out: 'smooth slow dolly-out pulling back to reveal scene',
  pan_left: 'horizontal tracking pan to the left',
  pan_right: 'horizontal tracking pan to the right',
  crane_down: 'elevated cinematic crane shot descending smoothly',
  hero_low_angle: 'dramatic low-angle hero push framing subject powerfully',
  orbital_spin: 'subtle 360-degree orbital rotation around central subject',
  handheld_dynamic: 'subtle organic handheld camera motion with natural micro-sway',
};

/**
 * Synthesizes a model-ready prompt for a single scene combining:
 * 1. Camera choreography tokens
 * 2. Persistent Character profile tokens (wardrobe, features, appearance)
 * 3. Specific scene action & visual description
 * 4. Master environment & lighting continuity tokens
 * 5. Visual genre & aesthetic style tags
 */
export function synthesizeScenePrompt(
  scene: Scene,
  continuityRules: ContinuityRules,
  characters: CharacterProfile[],
  visualGenre: string = 'Cinematic Photorealistic'
): string {
  const parts: string[] = [];

  // 1. Camera Direction
  const cameraText = CAMERA_DESCRIPTIONS[scene.cameraMovement] || 'cinematic camera framing';
  const cameraToken = `[Shot: ${cameraText}, ${continuityRules.cameraLensStyle || '35mm anamorphic'}]`;
  parts.push(cameraToken);

  // 2. Character Continuity Tokens
  const assignedCharacters = characters.filter((c) => scene.characterIds.includes(c.id));
  if (assignedCharacters.length > 0) {
    const charTokens = assignedCharacters.map((c) => {
      const details = [c.visualSummary, c.attireTokens, c.distinguishingFeatures]
        .filter(Boolean)
        .join(', ');
      return `${c.name} (${details})`;
    }).join(' and ');
    parts.push(`featuring ${charTokens}`);
  }

  // 3. Scene Action & Description
  if (scene.visualDescription) {
    parts.push(scene.visualDescription.trim());
  }

  // 4. Environment & Lighting Continuity
  const envDetails: string[] = [];
  if (scene.lightingAndAtmosphere) {
    envDetails.push(scene.lightingAndAtmosphere);
  } else if (continuityRules.lighting) {
    envDetails.push(continuityRules.lighting);
  }

  if (continuityRules.environmentTokens) {
    envDetails.push(continuityRules.environmentTokens);
  }

  if (continuityRules.colorPalette) {
    envDetails.push(`color grade: ${continuityRules.colorPalette}`);
  }

  if (envDetails.length > 0) {
    parts.push(`Environment & Atmosphere: ${envDetails.join(', ')}.`);
  }

  // 5. Aesthetic Quality Tags
  parts.push(`Aesthetic: ${visualGenre}, 8k resolution, ultra-detailed textures, masterpiece.`);

  return parts.join('. ');
}

/**
 * Batch synthesizes prompts for all scenes in a project
 */
export function synthesizeAllScenePrompts(project: Project): Scene[] {
  return project.scenes.map((scene) => ({
    ...scene,
    synthesizedPrompt: synthesizeScenePrompt(
      scene,
      project.continuityRules,
      project.characters,
      project.visualGenre
    ),
    status: scene.status === 'draft' ? 'prompt_ready' : scene.status,
  }));
}
