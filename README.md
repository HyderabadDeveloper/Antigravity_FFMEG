# AI Video Creation Platform — Complete 4-Phase Architecture

A production-grade, single-stack TypeScript platform implementing **all 4 phases** of the [AI Video Creation Platform Architecture](./video_creation_platform_architecture_final.md).

The platform transforms raw ideas into structured creative briefs, master character sheets, camera-choreographed scene storyboards, and anchored keyframes; dispatches takes through video generation adapters (Runway Gen-3, Google Veo, Luma Dream Machine, Kling AI, Azure OpenAI); ingests and normalizes footage via an automated FFmpeg worker queue; enables precision cut-point micro-trimming and side-by-side take comparison; and compiles multi-track timeline assemblies with TTS narration, styled timed subtitles (`.ass`), sidechain background music ducking, and master MP4 export.

---

## 4-Phase Architecture Delivery Matrix

| Phase | Status | Focus Area | Deliverables & Capabilities |
| :--- | :---: | :--- | :--- |
| **Phase 1** | **Completed** ✅ | **Creative Planning & Continuity Engine** | • Idea intake dashboard (aspect ratios 16:9, 9:16, 1:1, durations 15s-60s, genres, templates)<br>• AI Creative Director Chat with one-click brief sync & scene suggestion additions<br>• Master Character Continuity Sheets (wardrobe tokens, marks, voice attributes, lighting rules)<br>• Structured Scene Storyboard & Table with reading time estimates<br>• Continuity Prompt Engine (camera choreography + character tokens + environment)<br>• Keyframe Reference Studio (Flux AI image generation for I2V anchoring) |
| **Phase 2** | **Completed** ✅ | **Provider Adapters & Normalization Queue** | • Vendor-agnostic Provider Adapter Layer (`submit`, `getStatus`, `cancel`)<br>• Runway Gen-3 Alpha & Google Veo adapters with real API keys & simulation fallback<br>• Background Queue & Worker (`queued` ➔ `generating` ➔ `ingesting` ➔ `normalizing`)<br>• Automated FFmpeg Normalization: 30fps (`fps=30`), SAR 1:1, `yuv420p`, 48kHz AAC, `+faststart`<br>• Take Reviewer & Video Player with side-by-side raw vs normalized inspection |
| **Phase 3** | **Completed** ✅ | **Multi-Track Audio & Master Assembly** | • Text-to-Speech (TTS) Voiceover Engine (ElevenLabs API + procedural audio fallback)<br>• Word-level & sentence-level timestamp alignment<br>• Timed Subtitle Generation: Styled `.ass` (cinematic, bold, minimal) & standard `.srt`<br>• Cinematic Background Music Library with procedural harmonic audio synthesis<br>• Multi-Track FFmpeg Timeline Assembler with sidechain audio ducking under speech<br>• Master MP4 Video Export (1080p, 30fps, CRF 18 master quality) |
| **Phase 4** | **Completed** ✅ | **Multi-Provider Expansion & Advanced Controls** | • Expanded to 5 Integrated Provider Adapters: Runway Gen-3, Google Veo, Luma Dream Machine (Ray-2), Kling AI 1.5 HD, and Azure OpenAI / Foundry<br>• Provider Cost & Latency Benchmarking Matrix ($/sec, avg turnaround, quality scores)<br>• Smart Model Routing: Recommends optimal provider per scene (character ➔ Kling, motion ➔ Luma, atmosphere ➔ Veo)<br>• Take Micro-Trimming Studio: In-point & out-point scrubbing to remove motion artifacts<br>• Side-by-Side Take Version Comparison: Evaluate takes across different providers |

---

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Fullstack unified schema matching `VideoGenerationRequest`, `Scene`, `CharacterProfile`, `Take`, `GenerationJob`, `TimelineSettings`, `ProviderBenchmark`)
- **Styling**: Tailwind CSS with dark cyber-studio theme
- **Icons**: Lucide React
- **Media Engine**: FFmpeg (via `@ffmpeg-installer/ffmpeg` + `child_process`)
- **Video Delivery**: Custom streaming media route (`/api/media/[...path]`) supporting HTTP 206 Partial Content range requests
- **Data Persistence**: JSON-backed local storage in `data/projects.json` and `data/jobs.json` with automatic sample seeding
- **AI & Audio Engines**:
  - Creative Director Engine with structured schema extraction (supports optional `GEMINI_API_KEY` / `OPENAI_API_KEY`)
  - Keyframe Generation Engine powered by Flux (Pollinations AI) with zero mandatory API key setup
  - Provider Adapters: Runway Gen-3 (`RUNWAY_API_KEY`), Google Veo (`GEMINI_API_KEY`), Luma (`LUMA_API_KEY`), Kling (`KLING_API_KEY`), Azure (`AZURE_OPENAI_API_KEY`)
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
│   │   ├── projects/[id]/page.tsx    # Studio Workspace: 9-stage interactive tabs
│   │   └── api/
│   │       ├── projects/             # REST endpoints (List, Create, Update, Delete)
│   │       ├── brainstorm/           # AI Director chat route
│   │       ├── keyframes/generate/   # Reference anchor generator route
│   │       ├── synthesize-prompts/   # Batch prompt synthesis route
│   │       ├── queue/                # Video generation job queue & telemetry
│   │       ├── audio/                # TTS narration & background music
│   │       ├── assembly/export/      # Master timeline assembly & render route
│   │       ├── providers/benchmarks/ # Provider benchmarking metrics route
│   │       ├── takes/trim/           # Take in-point/out-point trimming route
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
│   │   │   ├── ProviderBenchmarkTab.tsx # Stage 8: Model Benchmarks & Precision Trimming
│   │   │   ├── ProviderExportTab.tsx # Stage 9: Provider payload inspection & export
│   │   │   ├── CharacterModal.tsx    # Register / edit character profile
│   │   │   └── SceneModal.tsx        # Add / edit scene take
│   │   └── ui/                       # Accessible Button, Badge, Modal components
│   ├── lib/
│   │   ├── promptEngine.ts           # Token injection & prompt synthesis algorithm
│   │   ├── aiService.ts              # Director reasoning & brainstorm logic
│   │   ├── imageService.ts           # Visual anchor generator (Flux)
│   │   ├── storage.ts                # Persistent storage layer & showcase project seeder
│   │   ├── audio/                    # TTS voiceover, subtitles, music stems
│   │   ├── ffmpeg/                   # FFmpeg normalizer & multi-track assembler
│   │   ├── providers/                # Runway, Veo, Luma, Kling, Azure adapters & benchmarks
│   │   ├── queue/                    # Background queue manager
│   │   └── utils.ts                  # ID generators, reading time calculators, formatting
│   └── types/
│       └── index.ts                  # Shared TypeScript interfaces
├── video_creation_platform_architecture_final.md # Master architecture blueprint
└── package.json
```
