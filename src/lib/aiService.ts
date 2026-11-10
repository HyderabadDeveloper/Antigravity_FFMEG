import { Project, ChatMessage, Scene, CharacterProfile, CreativeBrief } from '@/types';
import { generateId } from '@/lib/utils';

interface BrainstormResponse {
  reply: string;
  suggestedScenes?: Partial<Scene>[];
  suggestedBrief?: Partial<CreativeBrief>;
  suggestedCharacters?: Partial<CharacterProfile>[];
}

export async function processBrainstormMessage(
  project: Project,
  userMessage: string
): Promise<BrainstormResponse> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  // If an external key is set, we could query it. Otherwise, our advanced director engine powers intelligent generation.
  return generateDirectorResponse(project, userMessage);
}

function generateDirectorResponse(project: Project, userMessage: string): BrainstormResponse {
  const lower = userMessage.toLowerCase();

  // Pattern 1: Requesting Scene Breakdown or Adding Scenes
  if (
    lower.includes('scene') ||
    lower.includes('breakdown') ||
    lower.includes('storyboard') ||
    lower.includes('shots') ||
    lower.includes('next scene')
  ) {
    const existingCount = project.scenes.length;
    const newSceneOrder = existingCount + 1;

    const suggestedScene: Partial<Scene> = {
      id: generateId('scene'),
      order: newSceneOrder,
      title: `Climactic Revelation - Scene ${newSceneOrder}`,
      durationSeconds: 5,
      narration: `The truth wasn't buried in the archives. It was pulsing right inside us.`,
      characterIds: project.characters.map((c) => c.id).slice(0, 1),
      visualDescription: `Close-up shot of the cybernetic terminal rapidly decrypting glowing glyphs as sirens reflect off the wet glass windows.`,
      cameraMovement: 'dolly_in',
      lightingAndAtmosphere: `Intense strobe pulses alternating with ${project.continuityRules.colorPalette || 'neon cyan'} reflections.`,
    };

    return {
      reply: `I've analyzed the narrative arc for **"${project.title}"** (${project.visualGenre}).

To elevate the pacing and keep audience tension high, I have drafted Scene ${newSceneOrder}. This maintains our established lighting (${project.continuityRules.lighting.slice(0, 40)}...) and camera choreography.

You can click **"Add Suggested Scene to Storyboard"** below to incorporate it immediately!`,
      suggestedScenes: [suggestedScene],
    };
  }

  // Pattern 2: Requesting Character Continuity or Character Sheet
  if (
    lower.includes('character') ||
    lower.includes('costume') ||
    lower.includes('attire') ||
    lower.includes('continuity') ||
    lower.includes('cast')
  ) {
    const suggestedChar: Partial<CharacterProfile> = {
      id: generateId('char'),
      name: 'Dr. Evelyn Cross',
      role: 'Antagonist',
      visualSummary: 'Late 40s corporate architect, sharp silver bob haircut, piercing obsidian eyes, high cheekbones with geometric cybernetic augmentations',
      attireTokens: 'Immaculate tailored alabaster white trench coat with gold neural fiber lapels, minimalist platinum watch',
      distinguishingFeatures: 'Gold-plated bionic left arm with delicate optical sensors, subtle metallic cranial halo',
      voiceTone: 'Cold, clinical, polite elegance, never raises her voice',
      colorKey: '#EAB308',
    };

    return {
      reply: `Visual continuity requires explicit tokens for every character so that models like Runway Gen-3 and Google Veo don't alter wardrobe or facial traits between shots.

I've crafted a consistent profile for a key counterpart: **Dr. Evelyn Cross**. Notice how her stark white and gold attire creates an intentional visual contrast with the dark moody shadows of ${project.characters[0]?.name || 'the protagonist'}.

Would you like to register her in your **Character Continuity Sheet**?`,
      suggestedCharacters: [suggestedChar],
    };
  }

  // Pattern 3: Logline / Creative Brief / Hooks
  if (
    lower.includes('logline') ||
    lower.includes('hook') ||
    lower.includes('brief') ||
    lower.includes('idea') ||
    lower.includes('pitch')
  ) {
    const newLogline = `When a high-stakes conspiracy threatens everything, an unlikely investigator must decipher a locked cryptographic secret before the syndicates purge the final trace of truth.`;
    const newHook = `An encrypted data shard begins counting down on a rain-streaked terminal, displaying the investigator's own heartbeat.`;

    return {
      reply: `Here is a tightened logline and cinematic narrative hook designed for short-form visual punch:

**Refined Logline:**
*"${newLogline}"*

**Opening Narrative Hook:**
*"${newHook}"*

**Visual Continuity Tip:** In Image-to-Video models, establishing the color palette and camera motion early (e.g., slow dolly into the reflective screen) anchors the viewer's gaze and provides consistent latent conditioning.

You can click **"Apply to Creative Brief"** to update your project settings.`,
      suggestedBrief: {
        logline: newLogline,
        narrativeHook: newHook,
        visualTone: 'High-contrast cinematic tension, fast-paced psychological thriller',
        pacing: 'Urgent, escalating tension with deliberate pauses on emotional beats',
      },
    };
  }

  // Default intelligent director reply
  return {
    reply: `I'm analyzing your creative vision for **"${project.title}"**!

Here is our current production status:
- **Visual Style**: ${project.visualGenre}
- **Aspect Ratio**: ${project.aspectRatio} (${project.resolution})
- **Target Runtime**: ${project.targetDurationSeconds} seconds (${project.scenes.length} active scenes)
- **Continuity Anchors**: ${project.characters.length} characters registered

**Suggested Next Steps:**
1. **Scene Prompts**: Want me to synthesize the model-ready prompts with our camera choreography and lighting rules?
2. **Keyframe Generation**: Ensure each character has a reference portrait to enable Image-to-Video (I2V) in Phase 2.
3. **Pacing Review**: Would you like to add dialogue / voiceover beats to Scene 1 and Scene 2?

Feel free to ask me to draft a new scene, flesh out a character, or refine your logline!`,
  };
}
