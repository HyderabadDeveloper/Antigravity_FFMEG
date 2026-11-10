# AI Video Creation Platform — Phase 1: Creative Planning & Continuity Engine

A production-grade, single-stack TypeScript platform implementing **Phase 1** of the [AI Video Creation Platform Architecture](./video_creation_platform_architecture_final.md).

The platform transforms raw ideas into structured creative briefs, master character sheets, camera-choreographed scene storyboards, and anchored keyframe references ready for Image-to-Video (I2V) generation models (Google Veo, Runway Gen-3, Luma Dream Machine, Kling AI).

---

## Architecture Alignment (Phase 1 Deliverables)

| Architecture Stage | Platform Feature | Capability & Implementation |
| :--- | :--- | :--- |
| **Stage 1: Idea Intake** | **Project Dashboard & Intake** | Define concept, duration (15s, 30s, 60s), aspect ratio (`16:9`, `9:16`, `1:1`), visual genre presets, and target audience. Includes starter templates. |
| **Stage 2: Creative Brainstorm** | **AI Creative Director Chat** | Interactive LLM dialogue exploring narrative hooks, pacing, and visual themes. One-click actions to sync suggestions to the Creative Brief and add suggested scenes directly to the storyboard. |
| **Stage 3: Story & Continuity Setup** | **Character & Master Consistency Sheet** | Solves visual/facial drift by registering persistent character profiles (wardrobe, features, voice attributes) and universal lighting/lens tokens (`35mm anamorphic`, volumetric neon rim, negative constraints). |
| **Stage 4: Storyboard & Breakdown** | **Visual Storyboard & Table** | Deconstructs script into sequential takes with duration, narration with estimated reading time, character assignment, camera choreography (`dolly_in`, `crane_down`, `orbital_spin`), and re-ordering controls. |
| **Stage 5: Scene Prompt Synthesis** | **Continuity Prompt Engine** | Deterministically compiles character tokens, camera directions, environment lighting, and action descriptions into model-ready prompts for AI video generators. |
| **Stage 4 (I2V): Keyframe Studio** | **Visual Reference Anchors** | Generates high-fidelity keyframe images (Flux) to anchor character sheets and scene first-frames, preventing subject drift between cuts. |
| **Bridge to Phase 2** | **Provider Export & Bible Generator** | Previews unified dispatch payloads for Google Veo, Runway Gen-3, Luma, and Kling; exports complete Markdown Production Bibles and structured JSON for automated worker queues. |

---

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Fullstack unified schema matching `VideoGenerationRequest`, `Scene`, `CharacterProfile`)
- **Styling**: Tailwind CSS with dark cyber-studio theme
- **Icons**: Lucide React
- **Data Persistence**: JSON-backed local storage in `data/projects.json` with automatic sample seeding
- **AI Engines**:
  - Creative Director Engine with structured schema extraction (supports optional `GEMINI_API_KEY` / `OPENAI_API_KEY` in `.env`)
  - Keyframe Generation Engine powered by Flux (Pollinations AI) with zero mandatory API key setup

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
│   │   ├── projects/[id]/page.tsx    # Studio Workspace: 6-stage interactive tabs
│   │   └── api/
│   │       ├── projects/             # REST endpoints (List, Create, Update, Delete)
│   │       ├── brainstorm/           # AI Director chat route
│   │       ├── keyframes/generate/   # Reference anchor generator route
│   │       └── synthesize-prompts/   # Batch prompt synthesis route
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
│   │   │   ├── ProviderExportTab.tsx # Stage 6: Provider payload inspection & export
│   │   │   ├── CharacterModal.tsx    # Register / edit character profile
│   │   │   └── SceneModal.tsx        # Add / edit scene take
│   │   └── ui/                       # Accessible Button, Badge, Modal components
│   ├── lib/
│   │   ├── promptEngine.ts           # Token injection & prompt synthesis algorithm
│   │   ├── aiService.ts              # Director reasoning & brainstorm logic
│   │   ├── imageService.ts           # Visual anchor generator (Flux)
│   │   ├── storage.ts                # Persistent storage layer & showcase project seeder
│   │   └── utils.ts                  # ID generators, reading time calculators, formatting
│   └── types/
│       └── index.ts                  # Shared TypeScript interfaces
├── video_creation_platform_architecture_final.md # Master architecture blueprint
└── package.json
```

---

## Next Steps (Roadmap)
- **Phase 2**: BullMQ + Redis background worker, first video provider adapter (Runway Gen-3 / Google Veo with I2V), raw take ingestion, and FFmpeg normalization pipeline (`fps=30`, `yuv420p`, SAR 1:1, 48kHz audio).
