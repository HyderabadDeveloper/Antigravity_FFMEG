import fs from 'fs';
import path from 'path';
import { Project, CharacterProfile, Scene } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'projects.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initialProjects = [getSampleProject()];
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialProjects, null, 2), 'utf-8');
  }
}

export function getProjects(): Project[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as Project[];
  } catch (err) {
    console.error('Failed to read projects data file, returning empty list:', err);
    return [];
  }
}

export function getProjectById(id: string): Project | null {
  const projects = getProjects();
  return projects.find((p) => p.id === id) || null;
}

export function saveProject(project: Project): Project {
  ensureDataFile();
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  const updatedProject = {
    ...project,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    projects[index] = updatedProject;
  } else {
    projects.unshift(updatedProject);
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  return updatedProject;
}

export function deleteProject(id: string): boolean {
  ensureDataFile();
  const projects = getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length !== projects.length) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  }
  return false;
}

export function getSampleProject(): Project {
  const projectId = 'proj_cyberpunk_neon';
  const char1Id = 'char_jax';
  const char2Id = 'char_aria';

  const characters: CharacterProfile[] = [
    {
      id: char1Id,
      projectId,
      name: 'Detective Jax Vance',
      role: 'Protagonist',
      visualSummary: 'Early 30s cyber-noir detective, razor-sharp jawline, tired steel-grey eyes, slicked-back jet-black hair with silver temples',
      attireTokens: 'Distressed charcoal wool trenchcoat over high-collar carbon-fiber weave vest, fingerless tactical gloves, holster harness',
      distinguishingFeatures: 'Glowing cyan neural socket behind right ear, thin combat scar over left eyebrow',
      referenceKeyframeUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
      voiceTone: 'Deep raspy baritone, world-weary cadence, measured neo-noir monologue',
      colorKey: '#06B6D4',
    },
    {
      id: char2Id,
      projectId,
      name: 'Aria Thorne',
      role: 'Supporting',
      visualSummary: 'Mid 20s underworld memory broker, sharp angular features, iridescent amber eyes with micro-digital pupils',
      attireTokens: 'Translucent chromatic vinyl jacket over matte-black tactical jumpsuit, fiber-optic braided cords in cropped platinum hair',
      distinguishingFeatures: 'Gold filigree cybernetic fingertips on left hand, glowing sub-dermal collarbone tattoos',
      referenceKeyframeUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      voiceTone: 'Sardonic, crisp British accent, fast-paced and observant',
      colorKey: '#F43F5E',
    },
  ];

  const scenes: Scene[] = [
    {
      id: 'scene_1',
      projectId,
      order: 1,
      title: 'Neon Rain Descent',
      durationSeconds: 5,
      narration: 'In New Neo-Vegas, memories are the only currency that never loses value.',
      characterIds: [char1Id],
      visualDescription: 'Jax steps out of a dark alleyway onto a rain-slicked boulevard beneath towering holographic advertisements.',
      cameraMovement: 'dolly_in',
      lightingAndAtmosphere: 'Volumetric cyan and magenta neon rim lighting reflecting off puddle ripples, heavy dense acid rain mist',
      synthesizedPrompt: '[Shot: smooth slow dolly-in push towards subject, 35mm anamorphic lens, shallow depth of field]. featuring Detective Jax Vance (Early 30s cyber-noir detective, razor-sharp jawline, tired steel-grey eyes, slicked-back jet-black hair with silver temples, Distressed charcoal wool trenchcoat over high-collar carbon-fiber weave vest, fingerless tactical gloves, holster harness, Glowing cyan neural socket behind right ear, thin combat scar over left eyebrow). Jax steps out of a dark alleyway onto a rain-slicked boulevard beneath towering holographic advertisements. Environment & Atmosphere: Volumetric cyan and magenta neon rim lighting reflecting off puddle ripples, heavy dense acid rain mist, Rain-slicked wet asphalt, towering holographic megastructure billboards, hovering aerodynes, steam vents. Aesthetic: Cinematic Photorealistic, 8k resolution, ultra-detailed textures, masterpiece.',
      keyframeUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      keyframeStatus: 'ready',
      status: 'keyframe_ready',
    },
    {
      id: 'scene_2',
      projectId,
      order: 2,
      title: 'The Underground Exchange',
      durationSeconds: 5,
      narration: 'And Aria was the best broker in the lower sectors.',
      characterIds: [char1Id, char2Id],
      visualDescription: 'Inside a dim, smoke-filled basement booth, Aria slides an illuminated neural memory shard across a glass table towards Jax.',
      cameraMovement: 'crane_down',
      lightingAndAtmosphere: 'Moody amber underlighting from the glass tabletop, smoky haze with cyan backlight',
      synthesizedPrompt: '[Shot: elevated cinematic crane shot descending smoothly, 35mm anamorphic lens, shallow depth of field]. featuring Detective Jax Vance and Aria Thorne. Inside a dim, smoke-filled basement booth, Aria slides an illuminated neural memory shard across a glass table towards Jax. Environment & Atmosphere: Moody amber underlighting from the glass tabletop, smoky haze with cyan backlight, Rain-slicked wet asphalt, towering holographic megastructure billboards, hovering aerodynes, steam vents. Aesthetic: Cinematic Photorealistic, 8k resolution, ultra-detailed textures, masterpiece.',
      keyframeUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
      keyframeStatus: 'ready',
      status: 'keyframe_ready',
    },
    {
      id: 'scene_3',
      projectId,
      order: 3,
      title: 'The Threat Approaching',
      durationSeconds: 5,
      narration: 'Five seconds of stolen data. That was all it took to start a war.',
      characterIds: [char1Id],
      visualDescription: 'Jax looks up towards the shattered skylight above as automated security drones project red tracking searchlights into the room.',
      cameraMovement: 'hero_low_angle',
      lightingAndAtmosphere: 'Stark crimson alarm strobes slicing through dark shadows, harsh volumetric beam cutting across faces',
      synthesizedPrompt: '[Shot: dramatic low-angle hero push framing subject powerfully, 35mm anamorphic lens, shallow depth of field]. featuring Detective Jax Vance. Jax looks up towards the shattered skylight above as automated security drones project red tracking searchlights into the room. Environment & Atmosphere: Stark crimson alarm strobes slicing through dark shadows, harsh volumetric beam cutting across faces. Aesthetic: Cinematic Photorealistic, 8k resolution, ultra-detailed textures, masterpiece.',
      keyframeUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80',
      keyframeStatus: 'ready',
      status: 'keyframe_ready',
    },
  ];

  return {
    id: projectId,
    title: 'Cyberpunk Noir: The Memory Shard',
    concept: 'A hardboiled neo-noir thriller set in 2089 where a burned detective acquires an illegal memory shard that proves the city syndicate fabricated the last human election.',
    targetDurationSeconds: 15,
    aspectRatio: '16:9',
    resolution: '1080p',
    visualGenre: 'Cinematic Photorealistic Cyberpunk Noir',
    targetAudience: 'Sci-fi enthusiasts, cinematic storytellers, gaming narrative fans',
    creativeBrief: {
      logline: 'In rain-drenched Neo-Vegas, a cynical cyber-detective risks his life to deliver a decrypted memory shard to the one broker he still trusts.',
      narrativeHook: 'A glowing memory shard slides across glass just as red drone tracking lights silhouette the skylight.',
      visualTone: 'Gritty, atmospheric, high-contrast chiaroscuro with neon cybernetic accents.',
      pacing: 'Tense, deliberate build-up leading to an urgent cliffhanger.',
      keyThemes: ['Synthetic Identity', 'Corrupted Memory', 'Techno-Paranoia', 'Loyalty'],
      musicAtmosphere: 'Heavy analog synthesizer drone, slow sub-bass pulses, rain foley and distant sirens',
    },
    continuityRules: {
      lighting: 'Moody high-contrast volumetric neon cyan and magenta rim light, dark chiaroscuro shadows',
      cameraLensStyle: '35mm anamorphic prime lens, shallow depth of field f/1.8, natural Kodak 5219 film grain',
      colorPalette: 'Deep charcoal black (#0d1117), vibrant cyan (#06B6D4), magenta rim (#F43F5E), amber accents',
      environmentTokens: 'Rain-slicked wet asphalt, towering holographic megastructure billboards, hovering aerodynes, steam vents',
      negativeConstraints: 'cartoonish, oversaturated 3D CGI plastic, warped extra limbs, messy fingers, low-res pixelation, text watermarks',
    },
    characters,
    scenes,
    brainstormMessages: [
      {
        id: 'msg_1',
        sender: 'assistant',
        content: "Welcome to the Creative Planning Suite! I'm your AI Director. Let's build your story. We've established Jax Vance as our primary anchor and Aria as the broker. Would you like to refine the scene pacing, add a new twist, or synthesize prompts for Runway Gen-3 and Google Veo?",
        timestamp: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
