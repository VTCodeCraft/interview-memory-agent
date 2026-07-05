# Interview Memory Agent

An AI-powered mock interview platform with voice-based conversations, adaptive question generation, long-term semantic memory, and detailed analytics. Built with Next.js 16, Deepgram Voice Agent, Gemini AI, Clerk, Prisma/PostgreSQL, and Cognee Cloud.

---

## Architecture

```
Frontend (Next.js 16, Tailwind v4, shadcn/ui)
  ↓
Next.js API Routes (App Router)
  ↓
  ├── Clerk        → Authentication, user management, webhooks
  ├── Gemini       → Question generation, evaluation, resume/JD parsing, reports
  ├── Deepgram     → Voice Agent API (unified TTS + STT + conversation management)
  ├── Prisma/PG    → Structured data (users, interviews, reports, analytics)
  └── Cognee       → Long-term semantic memory (adaptive personalization)
```

### Directory Layout

```
app/                   → Next.js App Router pages & API routes
  api/                 → Backend API endpoints
    analytics/         → Analytics data
    auth/              → Auth (Clerk sync)
    cognee/            → Cognee health & forget endpoints
    interview/         → Interview CRUD, voice answer, start/end
    memory/            → Memory timeline & insights
    reports/           → Report generation & lookup
    speech/            → Deepgram token minting
    user/              → Onboarding, profile, resume, JD
    webhook/           → Clerk webhooks
  dashboard/           → Dashboard page
  onboarding/          → Onboarding wizard
  page.tsx             → Landing page
components/            → UI components
  auth/                → Auth UI
  common/              → Shared UI (headers, cards, etc.)
  dashboard/           → Dashboard widgets
  interview/           → VoiceInterview, QuestionCard, DeepgramStatus
  memory/              → Memory timeline views
  reports/             → Report display
  ui/                  → shadcn/ui primitives
hooks/                 → Client-side hooks
  useAnalytics.ts      → Analytics data fetching
  useAuth.ts           → Clerk auth wrapper
  useDeepgram.ts       → Legacy Deepgram STT hook
  useInterview.ts      → Interview state management
  useMemory.ts         → Memory timeline fetching
  useSpeech.ts         → Speech token management
  useTTS.ts            → Legacy TTS hook
  useVoiceAgent.ts     → Deepgram Voice Agent orchestrator (primary)
lib/                   → Shared utilities & provider adapters
  ai/                  → Gemini prompt builders & evaluation prompts
  auth/                → Clerk webhook sync utility
  cognee/              → Cognee Cloud HTTP client
  db/                  → Prisma client singleton
  deepgram/            → Deepgram SDK client & integrations
    voice-agent/       → Voice Agent connection, settings, audio pipeline
    text-to-speech.ts  → Legacy REST TTS
    speech-to-text.ts  → Legacy REST STT
    streaming.ts       → Legacy streaming STT
    websocket.ts       → Legacy WebSocket connection
  utils/               → Constants, helpers
  validations/         → Zod schemas
services/              → Application business logic
  analytics.service.ts → Analytics computation
  answer.service.ts    → Answer persistence
  auth.service.ts      → Auth sync
  cognee.service.ts    → Cognee API (remember, recall, improve, forget)
  deepgram.service.ts  → Deepgram token minting
  interview.service.ts → Interview lifecycle & evaluation
  memory-builder.service.ts → Semantic memory construction from reports
  memory.service.ts    → Memory persistence orchestration
  promptBuilder.service.ts → Interview prompt assembly
  questionGenerator.service.ts → Gemini question generation
  report.service.ts    → Report generation
  resumeParser.service.ts → Gemini-based resume parsing
  speech.service.ts    → Legacy speech re-exports
  tts.service.ts       → Legacy TTS service
  voiceInterview.service.ts → Voice Agent interview progression
store/                 → Zustand state management
  useVoiceAgentStore.ts → Voice Agent UI state
  useInterviewStore.ts → Interview state
  useMemoryStore.ts   → Memory state
  useAuthStore.ts     → Auth state
  useAnalyticsStore.ts → Analytics state
  useSettingsStore.ts  → Settings state
types/                 → TypeScript type definitions
  voiceAgent.ts       → Voice Agent conversation state machine types
  interview.ts        → Interview types
  report.ts           → Report & evaluation types (incl. HistoricalProgress)
  memory.ts           → Memory types
  analytics.ts        → Analytics types
  speech.ts           → Speech types
prisma/                → PostgreSQL schema & migrations
  schema.prisma       → User, Resume, JD, Interview, Answer, Report, Analytics
```

---

## Tech Stack

| Layer            | Technology                                                          |
| ---------------- | ------------------------------------------------------------------- |
| **Framework**    | Next.js 16 (App Router, React 19, TypeScript)                       |
| **Auth**         | Clerk (authentication, user management, webhooks)                   |
| **Database**     | PostgreSQL via Prisma ORM (Neon)                                    |
| **AI - Gen**     | Google Gemini (question gen, evaluation, resume/JD parsing)         |
| **Voice**        | Deepgram Voice Agent API (unified TTS + STT + conversation agent)   |
| **Memory**       | Cognee Cloud (long-term semantic memory graph)                      |
| **UI**           | Tailwind CSS v4, shadcn/ui, Lucide Icons                            |
| **State**        | Zustand                                                             |
| **Validation**   | Zod                                                                 |

---

## Deepgram Voice Agent (Replacing Separate TTS/STT)

This project originally used separate Deepgram REST endpoints for text-to-speech (`POST /v1/speak`) and speech-to-text (`POST /v1/listen`), with a custom WebSocket for streaming transcription. Those modules remain in the codebase (`lib/deepgram/text-to-speech.ts`, `lib/deepgram/speech-to-text.ts`, `lib/deepgram/streaming.ts`, `lib/deepgram/websocket.ts`) but are **no longer the primary voice path**.

The interview now uses **Deepgram's Voice Agent API** (`wss://agent.deepgram.com/v1/agent/converse`), which provides a single conversational AI that:

- **Listens** to the candidate via streaming microphone input
- **Thinks** with a built-in LLM that manages turn-taking
- **Speaks** generated or injected responses in natural-sounding TTS
- **Supports function calling** for structured answer-completion detection
- **Handles barge-in** (candidate interrupts the agent mid-speech)

The Voice Agent is orchestrated by the `useVoiceAgent` hook (`hooks/useVoiceAgent.ts`), which manages a persistent WebSocket connection, audio pipeline (mic recording + PCM playback), and a state machine with 25+ conversation states. The backend remains the source of truth: questions are generated by Gemini on the server and injected verbatim into the agent session. The agent never generates questions — it only conducts the conversation.

Key files:
- `hooks/useVoiceAgent.ts` — client-side orchestrator
- `lib/deepgram/voice-agent/connection.ts` — raw WebSocket to Deepgram
- `lib/deepgram/voice-agent/settings.ts` — agent configuration
- `lib/deepgram/voice-agent/audio/` — mic recorder & PCM player
- `services/voiceInterview.service.ts` — server-side answer save & advance
- `services/deepgram.service.ts` — server-side token minting
- `types/voiceAgent.ts` — conversation state machine types

---

## Cognee Integration (Long-Term Memory)

Cognee Cloud provides persistent semantic memory across interview sessions. Implemented in 7 phases:

| Phase | What It Does                                                   |
| ----- | -------------------------------------------------------------- |
| 1     | Cognee Cloud connection & health check                         |
| 2     | Memory Builder — converts interview reports to semantic memory |
| 3     | Persist semantic memory into Cognee after each interview       |
| 4     | Retrieve candidate memory before Gemini question generation    |
| 5     | Adaptive interview personalization using Cognee memory         |
| 6     | Longitudinal evaluation — compare current vs historical data   |
| 7     | Memory lifecycle — `improve()` (graph optimization) & `forget()` |

Key files:
- `lib/cognee/client.ts` — HTTP client for Cognee Cloud API
- `services/cognee.service.ts` — remember, recall, improve, forget
- `services/memory-builder.service.ts` — report-to-memory conversion
- `services/memory.service.ts` — persistence orchestration
- `services/promptBuilder.service.ts` — memory-injected prompts
- `lib/ai/evaluationPromptBuilder.ts` — historical context for evaluation
- `types/report.ts` — HistoricalProgress, HistoricalProgressTrend types

Cognee is an enhancement layer — the core interview flow continues even if Cognee is unavailable.

---

## Prisma / PostgreSQL Schema

| Model                | Purpose                                   |
| -------------------- | ----------------------------------------- |
| `User`               | Core user (linked to Clerk via `clerkId`) |
| `UserProfile`        | Onboarding data, preferences, target role |
| `Resume`             | Uploaded resume, parsed text, metadata    |
| `JobDescription`     | Target company JD, parsed skills          |
| `Interview`          | Interview sessions (status, mode, Qs)     |
| `Answer`             | Interview answers (JSON transcript)       |
| `Report`             | Evaluation scores, strengths, weaknesses  |
| `InterviewAnalytics` | Aggregated stats per user                 |

---

## API Routes

| Endpoint                         | Method | Purpose                                     |
| -------------------------------- | ------ | ------------------------------------------- |
| `/api/auth/me`                   | GET    | Current user & profile                      |
| `/api/user/onboarding`           | POST   | Complete onboarding                         |
| `/api/user/profile`              | GET/PATCH | Profile management                      |
| `/api/user/resume`               | POST   | Upload & parse resume                       |
| `/api/user/job-description`      | POST   | Upload & parse JD                           |
| `/api/interview/start`           | POST   | Create interview, generate questions        |
| `/api/interview/answer`          | POST   | Save text-mode answer                       |
| `/api/interview/voice-answer`    | POST   | Save voice answer & advance to next Q       |
| `/api/interview/voice-token`     | POST   | Mint Deepgram access token                  |
| `/api/interview/end`             | POST   | Complete interview, trigger evaluation      |
| `/api/interview/history`         | GET    | Past interviews list                        |
| `/api/reports/generate`          | POST   | Generate report for completed interview     |
| `/api/reports/:id`               | GET    | Specific report                             |
| `/api/analytics`                 | GET    | User analytics dashboard data               |
| `/api/memory/timeline`           | GET    | Memory timeline across interviews           |
| `/api/memory/insights`           | GET    | Cognee-derived insights                     |
| `/api/cognee/health`             | GET    | Cognee connection smoke test                |
| `/api/cognee/forget`             | DELETE | Delete user's Cognee memories               |
| `/api/webhook/clerk`             | POST   | Clerk user lifecycle events                 |
| `/api/speech/token`              | GET    | Legacy: Deepgram STT token                  |
| `/api/speech/transcribe`         | POST   | Legacy: audio file transcription            |
| `/api/speech/speak`              | POST   | Legacy: TTS audio stream                    |

---

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL instance (or Neon serverless)
- Deepgram API key with Voice Agent access
- Google Gemini API key
- Clerk Publishable & Secret keys
- Cognee Cloud API key & tenant

### Environment Variables

Create `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Database
DATABASE_URL=postgresql://...

# Deepgram
DEEPGRAM_API_KEY=

# Gemini
GEMINI_API_KEY=

# Cognee Cloud
COGNEE_BASE_URL=https://api.cognee.ai
COGNEE_API_KEY=
COGNEE_TENANT_ID=
COGNEE_USER_ID=
```

### Install & Run

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Validation

```bash
npm run typecheck
npm run lint
npm run build
```

### Seed Data

```bash
npm run db:seed
```

---

## Complete Interview Flow

```
User Login (Clerk)
  ↓
Onboarding → Resume Upload → JD Upload
  ↓
Resume & JD Parsing (Gemini)
  ↓
Retrieve Cognee Memory (recallCandidateMemory)
  ↓
Prompt Builder (resume + JD + memory → context)
  ↓
Gemini Question Generation
  ↓
Interview Session (Deepgram Voice Agent)
  ├── Agent speaks question (TTS via Voice Agent)
  ├── Candidate speaks answer (STT via Voice Agent)
  ├── Complete_answer detected (function call or silence fallback)
  └── Next question injected (repeat until done)
  ↓
Gemini Evaluation (with historical comparison if available)
  ↓
Report Generation + Analytics Update
  ↓
Cognee Memory Update (remember + improve)
  ↓
Next interview uses accumulated memory
```

---

## AI Agent Acknowledgment

This project was developed with assistance from AI coding agents, including **ChatGPT** and **GitHub Copilot**, which contributed to architecture design, code generation, debugging, and documentation. The entire Cognee integration (Phases 1–7) and voice agent pipeline were collaboratively built with these tools.
