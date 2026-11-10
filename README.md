# AI Video Creation Platform — Phase 1, 2 & 3: Production Suite

A production-grade, single-stack TypeScript platform implementing **Phase 1, Phase 2, and Phase 3** of the [AI Video Creation Platform Architecture](./video_creation_platform_architecture_final.md).

The platform transforms raw ideas into structured creative briefs, master character sheets, camera-choreographed scene storyboards, and anchored keyframes; dispatches takes through video generation adapters (Runway Gen-3, Google Veo); ingests and normalizes footage via an automated FFmpeg worker queue; and compiles multi-track timeline assemblies with TTS narration, styled timed subtitles (`.ass`), sidechain background music ducking, and master MP4 export.

---

## Architecture Alignment

| Architecture Stage | Platform Feature | Capability & Implementation |
| :--- | :--- | :--- |
| **Stage 1: Idea Intake** | **Project Dashboard & Intake** | Define concept, duration (15s, 30s, 60s), aspect ratio (`16:9`, `9:16`, `1:1`), visual genre presets, and target audience. Includes starter templates. |
| **Stage 2: Creative Brainstorm** | **AI Creative Director Chat** | Interactive LLM dialogue exploring narrative hooks, pacing, and visual themes. One-click actions to sync suggestions to the Creative Brief and add suggested scenes directly to the storyboard. |
| **Stage 3: Story & Continuity Setup** | **Character & Master Consistency Sheet** | Solves visual/facial drift by registering persistent character profiles (wardrobe, features, voice attributes) and universal lighting/lens tokens (`35mm anamorphic`, volumetric neon rim, negative constraints). |
| **Stage 4: Storyboard & Breakdown** | **Visual Storyboard & Table** | Deconstructs script into sequential takes with duration, narration with estimated reading time, character assignment, camera choreography (`dolly_in`, `crane_down`, `orbital_spin`), and re-ordering controls. |
| **Stage 5: Scene Prompt Synthesis** | **Continuity Prompt Engine** | Deterministically compiles character tokens, camera directions, environment lighting, and action descriptions into model-ready prompts for AI video generators. |
| **Stage 4 (I2V): Keyframe Studio** | **Visual Reference Anchors** | Generates high-fidelity keyframe images (Flux) to anchor character sheets and scene first-frames, preventing subject drift between cuts. |
| **Stage 6 & 7: Provider Adapters** | **Runway Gen-3 & Google Veo Adapters** | Vendor-agnostic Provider Adapter Layer (`submit`, `getStatus`, `cancel`) isolating the platform from model-specific APIs. Supports real API keys or simulation fallback with real video generation. |
| **Stage 7: Background Queue Worker** | **Queue Dispatch & Telemetry** | Asynchronous worker processing jobs (`queued` -> `generating` -> `ingesting` -> `normalizing` -> `completed`), concurrency control, progress tracking, and job cancellation. |
| **Stage 8: Clip Normalization** | **FFmpeg Pipeline Engine** | Automated ingestion & normalization filter chain: forces 30fps (`fps=30`), scales/pads to ratio (`1920:1080`, `1080:1920`, `1080:1080`), colorspace (`yuv420p`), standardizes audio (`48kHz AAC`), and adds `+faststart`. |
| **Stage 7 & 8: Clip Review UI** | **Take Reviewer & HTML5 Player** | Real-time queue progress bar, side-by-side player (Normalized Take vs Raw AI output), normalization compliance badges, and multi-take versioning with active take selection. |
| **Stage 9: Audio & Subtitle Synthesis** | **TTS & Subtitle Engine** | Generates voiceover narration per scene with word-level timestamps (ElevenLabs / OpenAI / procedural synthesis) and compiles styled `.ass` and standard `.srt` subtitle files. |
| **Stage 10: Timeline Assembly & Export** | **Multi-Track FFmpeg Assembler** | Stitches normalized scene takes, mixes background music stems with automated sidechain ducking beneath speech, burns subtitles, and exports master 1080p MP4. |

---

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Fullstack unified schema matching `VideoGenerationRequest`, `Scene`, `CharacterProfile`, `Take`, `GenerationJob`, `TimelineSettings`)
- **Styling**: Tailwind CSS with dark cyber-studio theme
- **Icons**: Lucide React
- **Media Engine**: FFmpeg (via `@ffmpeg-installer/ffmpeg` + `child_process`)
- **Video Delivery**: Custom streaming media route (`/api/media/[...path]`) supporting HTTP 206 Partial Content range requests
- **Data Persistence**: JSON-backed local storage in `data/projects.json` and `data/jobs.json` with automatic sample seeding
- **AI & Audio Engines**:
  - Creative Director Engine with structured schema extraction (supports optional `GEMINI_API_KEY` / `OPENAI_API_KEY`)
  - Keyframe Generation Engine powered by Flux (Pollinations AI) with zero mandatory API key setup
  - Provider Adapters: Runway Gen-3 Alpha (`RUNWAY_API_KEY`) and Google Veo (`GEMINI_API_KEY`)
  - Audio Engine: ElevenLabs TTS API (`ELEVENLABS_API_KEY`), procedural speech synthesizer, and harmonic background score generator

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── layout.tsx                # App root layout with studio dark theme
│   │   ├── page.tsx                  # Dashboard: Project cards, metrics, creation modal
│   │   ├── globals.css               # Studio CSS variables & custom scrollbars
│   │   ├── projects/[id]/page.tsx    # Studio Workspace: 8-stage interactive tabs
│   │   └── api/
│   │       ├── projects/             # REST endpoints (List, Create, Update, Delete)
│   │       ├── brainstorm/           # AI Director chat route
│   │       ├── keyframes/generate/   # Reference anchor generator route
│   │       ├── synthesize-prompts/   # Batch prompt synthesis route
│   │       ├── queue/                # Video generation job queue & telemetry
│   │       ├── audio/
│   │       │   ├── tts/              # Text-to-speech voiceover route
│   │       │   └── music/            # Background music tracks route
│   │       ├── assembly/export/      # Master timeline assembly & render route
│   │       └── media/[...path]/      # Streaming media server with Range header support
│   ├── components/
│   │   ├── Header.tsx                # Global navigation bar
│   │   ├── ProjectCard.tsx           # Dashboard project overview card
│   │   ├── CreateProjectModal.tsx    # Stage 1 project intake modal
│   │   ├── studio/
│   │   │   ├── StudioHeader.tsx      # Studio stepper navigation & prompt compiler
│   │   │   ├── IntakeConceptTab.tsx  # Stage 1: Creative Brief & Tone
│   │   │   ├── BrainstormChatTab.tsx # Stage 2: AI Director Chat
│   │   │   ├── ContinuityTab.tsx     # Stage 3: Character Consistency Sheets
│   │   │   ├── SceneStoryboardTab.tsx# Stage 4: Scene Storyboard & Table
│   │   │   ├── KeyframeStudioTab.tsx # Stage 5: Reference Keyframe Anchors (I2V)
│   │   │   ├── ClipReviewTab.tsx     # Stage 6: Clip Review & FFmpeg Normalization
│   │   │   ├── TimelineAssemblyTab.tsx # Stage 7: Multi-Track Timeline & Master Export
│   │   │   ├── ProviderExportTab.tsx # Stage 8: Provider payload inspection & export
│   │   │   ├── CharacterModal.tsx    # Register / edit character profile
│   │   │   └── SceneModal.tsx        # Add / edit scene take
│   │   └── ui/                       # Accessible Button, Badge, Modal components
│   ├── lib/
│   │   ├── promptEngine.ts           # Token injection & prompt synthesis algorithm
│   │   ├── aiService.ts              # Director reasoning & brainstorm logic
│   │   ├── imageService.ts           # Visual anchor generator (Flux)
│   │   ├── storage.ts                # Persistent storage layer & showcase project seeder
│   │   ├── audio/
│   │   │   ├── ttsService.ts         # Voiceover synthesis & word timestamps
│   │   │   ├── subtitleGenerator.ts  # Styled .ass & standard .srt generator
│   │   │   └── musicLibrary.ts       # Preset cinematic scores & procedural audio
│   │   ├── ffmpeg/
│   │   │   ├── normalizer.ts         # Deterministic FFmpeg normalization filter chain
│   │   │   └── assembler.ts          # Multi-track concatenation, audio ducking, subtitle burn-in
│   │   ├── providers/
│   │   │   ├── runwayAdapter.ts      # Runway Gen-3 Alpha Image-to-Video adapter
│   │   │   ├── googleVeoAdapter.ts   # Google Veo (Vertex AI) adapter
│   │   │   └── registry.ts           # Provider adapter factory & registry
│   │   ├── queue/
│   │   │   └── queueManager.ts       # Background Queue Worker & take persistence
│   │   └── utils.ts                  # ID generators, reading time calculators, formatting
│   └── types/
│       └── index.ts                  # Shared TypeScript interfaces
├── video_creation_platform_architecture_final.md # Master architecture blueprint
└── package.json
```

---

## Next Steps (Roadmap)
- **Phase 4**: Multi-Provider Expansion & Advanced Controls (additional adapters for Luma Dream Machine, Kling AI, Azure OpenAI Video, timeline trimming and cut-point micro-adjustments, take version comparisons, and provider cost/latency benchmarking).
