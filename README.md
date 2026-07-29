# Interview Memory Agent (Clutchly)

An AI-powered, full-duplex voice mock interview platform with adaptive question generation, long-term semantic graph memory, multi-stage performance evaluation, and granular pipeline cost observability.

Built with **Next.js 16 (App Router)**, **Deepgram Voice Agent API**, **Google Gemini 2.5/1.5**, **Cognee Cloud Semantic Memory**, **Clerk Authentication**, and **Prisma ORM with PostgreSQL**.

---

## 📌 Executive Summary & Architecture Overview

Interview Memory Agent (Clutchly) is an interactive voice-first AI interview coach. Unlike simple chatbot interfaces, Clutchly creates realistic, adaptive technical and behavioral interviews. It remembers a user's performance across multiple sessions using long-term semantic graph memory, dynamically tailoring future questions to address historical weaknesses, reinforce strengths, and track longitudinal progress over time.

### Core Architectural Layers

```
                                  +-------------------------------------------------------+
                                  |              Client Interface (Next.js 16)            |
                                  |   Tailwind CSS v4, shadcn/ui, Bricolage Grotesque,    |
                                  |      Zustand Stores, AudioContext PCM Recorder/Player |
                                  +---------------------------+---------------------------+
                                                              |
                                           +------------------+------------------+
                                           |                                     |
                                  (REST API / App Router)             (Full-Duplex WebSockets)
                                           |                                     |
                                           v                                     v
+------------------------------------------------------------------+ +-----------------------------------+
|                     Next.js Backend API Routes                   | |    Deepgram Voice Agent API      |
|  /api/interview/*, /api/user/*, /api/reports/*, /api/memory/*   | | wss://agent.deepgram.com/v1/... |
+----+-------------------+-------------------+--------------------+ |  STT (Nova-3) + Agent LLM         |
     |                   |                   |                    | |  + TTS (Aura-2-Thalia)          |
     v                   v                   v                    v +-----------------------------------+
+----------+     +---------------+     +-----------+     +-------------------+
|  Clerk   |     | Google Gemini |     |  Cognee   |     | Prisma / Postgres |
| User Sync|     |  Question Gen |     | Semantic  |     | Structured Data,  |
| Webhooks |     |  Evaluation   |     | Memory    |     | Pipeline Metrics, |
| Account  |     |  Parsing      |     |  Graph    |     | Session Costs     |
| Delete   |     +---------------+     +-----------+     +-------------------+
+----------+
```

---

## 🛠️ Technology Stack

| Component | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.2.9 (App Router, React 19, TypeScript 5) | Full-stack Web Application Framework |
| **Authentication** | `@clerk/nextjs` v7.5.12 | Authentication, user sync via webhooks, tombstone deletion logs |
| **Database & ORM** | PostgreSQL (Neon serverless) via `@prisma/client` v7.8.0 | Structured relational persistence & pipeline observability |
| **Voice Engine** | `@deepgram/sdk` v5.5.0 (Voice Agent WebSocket API) | Full-duplex voice streaming, STT (Nova-3), TTS (Aura-2-Thalia), turn-taking |
| **Generative AI** | `@google/generative-ai` v0.21.0 (Gemini 2.5 / 1.5) | Question generation, answer evaluation, resume/JD parsing, report generation |
| **Semantic Memory** | Cognee Cloud HTTP API (`https://api.cognee.ai`) | Long-term memory ingestion (`cognify`), vector search (`recall`), graph optimization (`improve`), and memory erasure (`forget`) |
| **State Management**| Zustand v5.0.2 | Reactive client-side stores (Voice Agent, Interview, Memory, Auth, Analytics, Settings) |
| **Styling** | Tailwind CSS v4, `@fontsource-variable/material-symbols-outlined` | Modern UI styling, Bricolage Grotesque typography |
| **Validation & Parsing**| Zod, `pdf-parse` v1.1.1 | Input validation schemas & PDF resume text extraction |
| **Testing & Tooling** | Vitest v4.1.9, ESLint 9, Prisma Studio | Unit testing, linting, and database inspection |

---

## 📁 Repository Directory Structure

```
interview-memory-agent/
├── app/                        → Next.js 16 App Router pages & API routes
│   ├── api/                    → Backend HTTP Endpoints
│   │   ├── analytics/          → User analytics & aggregate readiness scores
│   │   ├── auth/               → Authentication user context routes
│   │   ├── cognee/             → Health checks & memory erasure (`forget`)
│   │   ├── cron/               → Scheduled background workers (reports, cleanup, cost reconciliation)
│   │   ├── health/             → System status endpoint
│   │   ├── interview/          → Interview lifecycle, question generation, voice tokens, answer saving
│   │   ├── memory/             → Knowledge graph, memory timeline, & insights
│   │   ├── reports/            → Evaluation report generation & retrieval
│   │   ├── speech/             → Legacy Deepgram speech endpoints
│   │   ├── user/               → Onboarding, profile, resume, JD parsing, account management
│   │   └── webhook/            → Clerk webhook event handler (`user.created`, `user.deleted`)
│   ├── dashboard/              → Candidate dashboard page
│   ├── onboarding/             → User setup wizard (Profile, Target Role, Resume, JD)
│   └── page.tsx                → Clutchly Landing Page (Design system inspired by Linear & Vercel)
├── components/                 → Modular React Components
│   ├── auth/                   → User authentication dialogs & status
│   ├── common/                 → Header, Footer, Navbar, Card layouts
│   ├── dashboard/              → Stats cards, interview list, readiness charts
│   ├── interview/              → VoiceInterview component, Question cards, Deepgram status visualizer
│   ├── landing-page/           → Hero, Feature showcase, FAQ, Testimonials
│   ├── memory/                 → Memory timeline visualization & Cognee graph widgets
│   ├── reports/                → Comprehensive interview report view with score radar/bars
│   └── ui/                     → Base UI primitives (buttons, dialogs, badges, progress indicators)
├── hooks/                      → Custom React Hooks
│   ├── useAnalytics.ts         → Fetching & syncing user analytics
│   ├── useAuth.ts              → Wrapper around Clerk authentication & user profile
│   ├── useDeepgram.ts          → Legacy Deepgram STT listener
│   ├── useInterview.ts         → Core interview session orchestration
│   ├── useMemory.ts            → Memory timeline & Cognee insight hooks
│   ├── useSpeech.ts            → Audio token fetching
│   ├── useTTS.ts               → Legacy REST Text-To-Speech hook
│   └── useVoiceAgent.ts        → Primary Deepgram Voice Agent WebSocket client & audio pipeline controller
├── lib/                        → Core Utilities & External Integrations
│   ├── ai/                     → Gemini API configuration, prompts, evaluation builders, pricing metrics
│   ├── auth/                   → Clerk sync utilities
│   ├── cognee/                 → Cognee Cloud API HTTP client, Graph validator, logger
│   ├── db/                     → Prisma Client singleton initialization
│   ├── deepgram/               → Deepgram Voice Agent WebSocket, settings, PCM audio recorder & player
│   ├── errors/                 → Custom error types & boundaries
│   ├── interview/              → Helper utilities for interview flow
│   ├── rate-limit/             → Rate-limiting logic for API routes
│   └── validations/            → Zod schemas for user input & API payloads
├── services/                   → Business Logic & Service Layer
│   ├── analytics.service.ts    → Computing user stats, streaks, & readiness scores
│   ├── answer.service.ts       → Interview answer transcript persistence
│   ├── auth.service.ts        → User creation & Clerk synchronization logic
│   ├── cognee.service.ts      → Cognee Cloud remember, recall, improve, and forget orchestration
│   ├── deepgram.service.ts    → Deepgram temporary access token minting
│   ├── interview.service.ts   → Interview session creation, question advance, & status transitions
│   ├── memory-builder.service.ts → Transcripts & report conversion to Cognee semantic memory graph format
│   ├── memory.service.ts       → Coordinating memory retrieval & persistence pipeline
│   ├── pipelineUsage.service.ts→ Observability service tracking token counts, latency, USD costs per stage
│   ├── promptBuilder.service.ts→ Ingesting candidate memory into Gemini question generation prompts
│   ├── questionGenerator.service.ts → Gemini question generation with difficulty scaling
│   ├── report.service.ts       → Gemini evaluation report generation
│   ├── resumeParser.service.ts → Extracting skills, experience, and background from uploaded PDFs
│   ├── user.service.ts         → Profile updates, resume/JD saving, account deletion
│   └── voiceInterview.service.ts→ Server-side Voice Agent state transitions & answer saving
├── store/                      → Zustand Client State Stores
│   ├── useAnalyticsStore.ts    → Analytics UI state
│   ├── useAuthStore.ts        → Authenticated user state
│   ├── useInterviewStore.ts   → Active interview session state
│   ├── useMemoryStore.ts      → Cached Cognee memory timeline
│   ├── useSettingsStore.ts   → User preferences & voice agent settings
│   └── useVoiceAgentStore.ts  → Voice Agent WebSocket state machine (25+ states, connection, audio levels)
├── types/                      → TypeScript Interfaces & Type Declarations
│   ├── analytics.ts            → Analytics & score data types
│   ├── interview.ts            → Interview, Question, Answer types
│   ├── memory.ts               → Cognee node, edge, and timeline types
│   ├── report.ts               → Evaluation report & historical progress types
│   └── voiceAgent.ts           → Deepgram Voice Agent state machine & event types
├── prisma/                     → Database Schema & Migrations
│   └── schema.prisma           → Database models (User, Interview, Report, PipelineUsage, DeepgramSession, etc.)
└── DESIGN.MD                   → Brand design language & style guidelines for Clutchly UI
```

---

## 🎙️ Deepgram Voice Agent Architecture (Full-Duplex Speech System)

The primary voice interface of Clutchly uses **Deepgram's Voice Agent API** (`wss://agent.deepgram.com/v1/agent/converse`). This replaces legacy fragmented STT/TTS calls with a single WebSocket session managing real-time speech input, LLM-based turn-taking, barge-in detection, and natural TTS playback.

### Key Voice Agent Components

1. **WebSocket Connection ([lib/deepgram/voice-agent/connection.ts](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/lib/deepgram/voice-agent/connection.ts))**:
   - Opens WebSocket connection to `wss://agent.deepgram.com/v1/agent/converse`.
   - Sends initial configuration settings payload upon connection.
   - Listens for server events: `Welcome`, `SettingsApplied`, `UserStartedSpeaking`, `AgentThinking`, `AgentStartedSpeaking`, `AgentAudioDone`, `FunctionCallRequest`, `Error`.

2. **Agent Settings ([lib/deepgram/voice-agent/settings.ts](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/lib/deepgram/voice-agent/settings.ts))**:
   - STT Model: `nova-3` (English) with smart formatting.
   - Agent Model: `anthropic/claude-3-5-haiku` (orchestrates conversational flow and prompt guidance).
   - TTS Model: `aura-2-thalia-en` (high-fidelity natural speech synthesis).
   - Function Calling Registration: `complete_answer` tool allows the agent to signal when a user has completed answering a question.

3. **Audio Pipeline ([lib/deepgram/voice-agent/audio/](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/lib/deepgram/voice-agent/audio/))**:
   - **PCM Recorder**: Captures microphone input via Web Audio API (`AudioContext`, `ScriptProcessorNode`), downsamples to **16kHz 16-bit Mono Linear PCM**, and streams binary frames over the WebSocket.
   - **PCM Player**: Receives binary TTS audio chunks from Deepgram, buffers them in a queue, and plays them smoothly via `AudioContext` at **24kHz 16-bit Mono Linear PCM**. Supports immediate flush upon candidate barge-in (interruption).

4. **Client Orchestrator ([hooks/useVoiceAgent.ts](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/hooks/useVoiceAgent.ts))**:
   - Manages a 25+ state conversation state machine (`IDLE`, `CONNECTING`, `LISTENING`, `THINKING`, `SPEAKING`, `FUNCTION_CALLING`, `ANSWER_COMPLETED`, etc.).
   - Communicates with Next.js backend API `/api/interview/voice/answer` to save recorded candidate transcripts and fetch the next question to inject into the agent.

5. **Token Minting & Session Reconciliation**:
   - Server-side temporary access token generation via `/api/interview/voice/token` ([services/deepgram.service.ts](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/services/deepgram.service.ts)).
   - Session tracking in database (`DeepgramSession` table) with nightly cron reconciliation ([app/api/cron/reconcile-deepgram-costs](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/app/api/cron/reconcile-deepgram-costs/route.ts)) against Deepgram Usage API.

---

## 🧠 Cognee Cloud Long-Term Semantic Memory Engine

Clutchly integrates **Cognee Cloud** (`https://api.cognee.ai`) to store structured semantic memories across candidate sessions. This powers personalized interview adaptation and longitudinal tracking over time across 7 distinct phases:

| Phase | Functional Stage | Technical Implementation | Key File(s) |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Connection & Health Check | HTTP client initialization, authorization token management, health checks | [lib/cognee/client.ts](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/lib/cognee/client.ts) |
| **Phase 2** | Memory Builder | Converts evaluation reports into semantic nodes (strengths, weaknesses, missed topics, recommendations) and graph edges | [services/memory-builder.service.ts](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/services/memory-builder.service.ts) |
| **Phase 3** | Ingestion (`remember`) | Ingests text memories via `POST /api/v2/datasets` and executes `cognify` graph processing | [services/cognee.service.ts](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/services/cognee.service.ts) |
| **Phase 4** | Retrieval (`recall`) | Queries candidate graph via `POST /api/v2/search` for relevant historical context before generating questions | [services/cognee.service.ts](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/services/cognee.service.ts) |
| **Phase 5** | Adaptive Question Generation | Injects recalled candidate memory context into Gemini prompts to probe past weaknesses & target missing skills | [services/promptBuilder.service.ts](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/services/promptBuilder.service.ts) |
| **Phase 6** | Longitudinal Evaluation | Compares current answers against historical benchmarks for trend analysis (improving, degrading, consistent) | [lib/ai/evaluationPromptBuilder.ts](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/lib/ai/evaluationPromptBuilder.ts) |
| **Phase 7** | Memory Lifecycle | Graph optimization (`improve`) to prune duplicate concepts, and dataset deletion (`forget`) via `/api/cognee/forget` | [services/cognee.service.ts](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/services/cognee.service.ts) |

---

## 📊 Pipeline Observability & Cost Metric System

Every interview execution is tracked end-to-end by the **Pipeline Observability Engine** ([services/pipelineUsage.service.ts](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/services/pipelineUsage.service.ts)). This tracks exact latency, token counts, error status, and calculated financial cost in USD across all external AI services:

```
+---------------------------------------------------------------------------------------------------+
|                                  InterviewPipelineUsage Metrics                                   |
+---------------------------------------------------------------------------------------------------+
| Stage 1: Question Generation  → Gemini Model, Input/Output Tokens, Gemini Cost (USD), Duration Ms |
| Stage 2: Deepgram Voice Session → Deepgram Audio Seconds, WebSocket Requests, Reconciled Cost USD |
| Stage 3: Report Evaluation    → Gemini Model, Evaluation Input/Output Tokens, Report Cost (USD)   |
| Stage 4: Cognee Graph Ingest   → Nodes & Edges Created, Ingestion Duration Ms, Cognee Cost (USD)  |
| Stage 5: Cognee Retrieval      → Nodes Retrieved, Search Latency Ms, Cognee Cost (USD)            |
+---------------------------------------------------------------------------------------------------+
| Total Cost (USD) = Gemini Question Cost + Deepgram Audio Cost + Gemini Report Cost + Cognee Cost |
+---------------------------------------------------------------------------------------------------+
```

---

## 🗄️ Database Schema & Prisma Models

The database is built on **PostgreSQL** using **Prisma ORM** ([prisma/schema.prisma](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/prisma/schema.prisma)):

### Core Data Models

- **`User`**: Linked to Clerk authentication via `clerkId`. Owns profiles, resumes, job descriptions, interviews, and analytics.
- **`UserProfile`**: Stores experience level, target role, target companies, preferred interview mode (`VOICE`, `TEXT`, `HYBRID`), and difficulty (`EASY`, `MEDIUM`, `HARD`).
- **`Resume`**: Metadata and extracted raw text from PDF resume uploads.
- **`JobDescription`**: Company, title, raw text, and array of parsed required skills.
- **`Interview`**: Represents an interview session (`PENDING`, `GENERATING`, `READY`, `ONGOING`, `COMPLETED`, `CANCELLED`, `FAILED`). Stores JSON questions and links to answers, reports, and pipeline usage metrics.
- **`Answer`**: Stores complete interview transcript (user audio answers, time taken, question associations).
- **`Report`**: Stores evaluation metrics (overall, technical, communication, confidence, behavioral, problem-solving scores 0-100), strengths, weaknesses, missing topics, and recommendations.
- **`InterviewAnalytics`**: Aggregated user stats (total interviews completed, average score, streak count, readiness score).
- **`AccountDeletionLog`**: Immutable tombstone log preserving usage data when a user deletes their account to prevent freemium usage limit reset exploits.
- **`ReportGenerationJob`**: Background job queue model for resilient evaluation report processing and retry handling.
- **`InterviewPipelineUsage`**: Comprehensive observability model tracking token consumption, durations, USD cost metrics, and failure reasons per pipeline step.
- **`DeepgramSession`**: Individual Deepgram Voice Agent WebSocket connection request IDs, connection attempt numbers, and reconciled costs from Deepgram API.

---

## 🌐 API Route Reference

### 🔐 Auth & User Management

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/auth/me` | Fetch currently authenticated user and profile information |
| `POST` | `/api/user/onboarding` | Submit onboarding wizard data (target role, experience, preferences) |
| `GET/PATCH` | `/api/user/profile` | Retrieve or update user preferences and profile parameters |
| `POST` | `/api/user/resume` | Upload and parse candidate PDF resume using Gemini AI |
| `POST` | `/api/user/job-description` | Submit target company job description and parse skills |
| `GET` | `/api/user/usage` | Retrieve user interview quotas and usage count |
| `POST` | `/api/user/delete-account` | Execute user account hard deletion and write tombstone log |
| `POST` | `/api/webhook/clerk` | Clerk webhook event handler (`user.created`, `user.deleted`) |

### 🎙️ Interview Lifecycle & Voice

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/interview/start` | Initialize interview session, trigger memory recall, and request question gen |
| `POST` | `/api/interview/generate` | Generate adaptive interview questions using Gemini |
| `GET` | `/api/interview/active` | Check for existing ongoing interview session |
| `GET` | `/api/interview/[id]` | Fetch detailed interview session state and questions |
| `POST` | `/api/interview/voice/token` | Mint temporary Deepgram access token for Voice Agent WebSocket |
| `POST` | `/api/interview/voice/answer` | Save voice response chunk and advance to next question |
| `POST` | `/api/interview/answer` | Save text-mode interview answer |
| `POST` | `/api/interview/end` | Complete interview session and enqueue evaluation report job |
| `POST` | `/api/interview/cancel` | Cancel an ongoing interview |
| `GET` | `/api/interview/history` | List historical completed interviews for user |

### 📈 Reports, Memory & Analytics

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/reports/generate` | Generate Gemini evaluation report for completed interview |
| `GET` | `/api/reports/[id]` | Fetch full report data including historical comparison trends |
| `GET` | `/api/analytics` | Fetch candidate readiness scores, score history, and skill radars |
| `GET` | `/api/memory/timeline` | Retrieve chronological timeline of candidate performance |
| `GET` | `/api/memory/insights` | Retrieve Cognee-derived intelligence and recurring weakness patterns |
| `GET` | `/api/memory/graph` | Retrieve visual node/edge memory graph representation |
| `GET` | `/api/cognee/health` | Smoke test Cognee Cloud connectivity |
| `DELETE`| `/api/cognee/forget` | Clear user semantic memory graph dataset in Cognee |

### ⏰ Cron Jobs & Observability

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/cron/process-reports` | Background worker processing pending report jobs |
| `POST` | `/api/cron/cleanup-interviews` | Prunes abandoned/stale pending interview records |
| `POST` | `/api/cron/reconcile-deepgram-costs` | Nightly cron querying Deepgram API to reconcile Voice Agent costs |

---

## ⚡ Client State Management (Zustand Stores)

State management is decoupled into distinct client-side Zustand stores ([store/](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/store)):

1. **`useVoiceAgentStore`**: Manages Deepgram Voice Agent WebSocket connection status, 25+ conversation state machine, current question index, agent speaking state, audio volume levels, and error logs.
2. **`useInterviewStore`**: Tracks active interview metadata, current question, submitted answers array, time remaining, and modal UI states.
3. **`useMemoryStore`**: Manages cached memory timeline items, Cognee graph nodes/edges, and search filters.
4. **`useAuthStore`**: Stores user authentication context, Clerk session data, and user profile state.
5. **`useAnalyticsStore`**: Caches dashboard analytics metrics, score history, and readiness calculations.
6. **`useSettingsStore`**: Stores user client preferences (microphone device ID, audio feedback toggles, voice selection).

---

## 🔄 End-to-End Interview Execution Flow

```
1. User Authentication & Onboarding
   ↳ User logs in via Clerk → Uploads Resume & Target Job Description.
   ↳ Gemini parses resume skills & job description targets into structured JSON.

2. Interview Setup & Memory Ingestion
   ↳ User selects role, interview type (Technical/Behavioral), and difficulty (Easy/Medium/Hard).
   ↳ Backend calls `cognee.service.ts` → `recallCandidateMemory()`.
   ↳ Cognee searches historical dataset for past weak areas, recurring mistakes, and missing topics.

3. Question Generation (Gemini 2.5/1.5)
   ↳ `promptBuilder.service.ts` merges:
     • Job Description & Candidate Resume
     • Recalled Cognee Memory (weaknesses to target, strengths to test further)
   ↳ Gemini returns structured array of customized interview questions.

4. Real-Time Voice Interview Execution
   ↳ App mints Deepgram token (`POST /api/interview/voice/token`).
   ↳ `useVoiceAgent.ts` connects WebSocket to `wss://agent.deepgram.com/v1/agent/converse`.
   ↳ Web Audio API records 16kHz PCM audio → Streams to Deepgram.
   ↳ Agent reads question via TTS (`aura-2-thalia`) → Candidate responds via microphone.
   ↳ Agent executes turn-taking and invokes `complete_answer` tool call when candidate finishes.
   ↳ Response is saved via `/api/interview/voice/answer` and next question is injected.

5. Evaluation & Report Generation
   ↳ Interview completed (`POST /api/interview/end`).
   ↳ Gemini evaluates answers against questions, resume, and historical evaluations.
   ↳ Generates scores (Overall, Technical, Communication, Confidence, Behavioral, Problem-Solving).
   ↳ Calculates historical progress trends (improving/degrading).

6. Memory Graph Update & Cost Finalization
   ↳ `memory-builder.service.ts` converts evaluation findings into semantic nodes/edges.
   ↳ `cognee.service.ts` runs `remember()` & `cognify()` to update Cognee Cloud graph.
   ↳ Cognee graph optimization (`improve()`) deduplicates concepts.
   ↳ `pipelineUsage.service.ts` seals total token usage, durations, and calculated costs in USD.
```

---

## ⚙️ Environment Variables & Setup Guide

### Environment Configuration (`.env.local`)

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# PostgreSQL Database (Neon serverless or local Postgres)
DATABASE_URL="postgresql://user:password@ep-host.region.aws.neon.tech/neondb?sslmode=require"

# Deepgram Speech & Voice Agent API
DEEPGRAM_API_KEY=your_deepgram_api_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Cognee Cloud Long-Term Memory
COGNEE_BASE_URL=https://api.cognee.ai
COGNEE_API_KEY=your_cognee_api_key
COGNEE_TENANT_ID=your_cognee_tenant_id
COGNEE_USER_ID=your_cognee_user_id

# System Cron Secret Key
CRON_SECRET=your_cron_job_secret_key
```

### Installation & Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Generate Database Client & Push Schema**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Seed Initial Database Content** *(Optional)*:
   ```bash
   npm run db:seed
   ```

4. **Launch Development Server**:
   ```bash
   npm run dev
   ```

5. **Type Checking & Linting**:
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```

---

## 💡 LLM Developer Guidelines & Context

If you are an **LLM assisting with code generation, feature development, or debugging in this repository**, keep the following technical rules in mind:

1. **App Router Conventions**: Next.js 16 is used with Server Actions and API route handlers (`app/api/`). Always maintain clear separation between `"server-only"` modules (services, database calls) and Client Components.
2. **Deepgram Voice Agent API**: Do NOT replace the WebSocket Voice Agent (`wss://agent.deepgram.com/v1/agent/converse`) with legacy STT/TTS REST calls unless specifically instructed. Audio handling relies on Web Audio API `AudioContext` with **16kHz PCM recorder** and **24kHz PCM player**.
3. **Cognee Cloud Data-Plane Interface**: All Cognee operations MUST route through [services/cognee.service.ts](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/services/cognee.service.ts). Do not call `lib/cognee/client.ts` directly from API handlers or UI components. Cognee failures must be handled gracefully so core interview operations are never blocked.
4. **Pipeline Observability Enforcement**: When adding new AI stages or external integrations, update [services/pipelineUsage.service.ts](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/services/pipelineUsage.service.ts) and [lib/ai/pricing.ts](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/lib/ai/pricing.ts) to track execution status, attempt counts, latency, and USD cost metrics.
5. **State Management**: UI updates during voice interviews belong in [store/useVoiceAgentStore.ts](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/store/useVoiceAgentStore.ts) or [store/useInterviewStore.ts](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/store/useInterviewStore.ts). Avoid duplicating state across local React hooks and Zustand stores.
6. **Prisma & Schema Changes**: Any schema changes in [prisma/schema.prisma](file:///c:/Users/trvis/OneDrive/Desktop/WORK/Projects/interview-memory-agent/prisma/schema.prisma) must preserve existing models (`User`, `Interview`, `Report`, `InterviewPipelineUsage`, `DeepgramSession`, `AccountDeletionLog`). Always run `npx prisma generate` after altering schemas.

---

## 📄 License & Acknowledgments

Developed as an advanced AI interview coach. Special acknowledgment to **Deepgram**, **Google Gemini**, **Cognee Cloud**, **Clerk**, and **Vercel** for providing the infrastructure powering Clutchly.
