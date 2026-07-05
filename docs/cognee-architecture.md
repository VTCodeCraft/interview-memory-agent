# Cognee Integration — Production Architecture

This document describes the complete Cognee memory integration as it exists after Phase 8 hardening. It covers the memory lifecycle, retrieval flow, storage flow, error handling, fallback strategy, and observability.

---

## 1. Overview

Cognee provides **long-term semantic memory** for the AI interview platform. It stores structured interview outcomes after each session and retrieves them before the next session so that:

- Question generation is personalized to the candidate's history.
- Evaluation compares current performance against historical trends.
- The memory graph improves over time with each new interview.
- All memories are removed cleanly when a user deletes their account.

Cognee is an **enhancement layer**. The entire interview pipeline functions correctly without it. If Cognee is unreachable or returns empty results, the application behaves exactly as it did before the integration.

---

## 2. Memory Lifecycle

```
Interview Start
    │
    ├─── recall() ──────────────────────────────────────────────┐
    │    Purpose: question-generation personalization            │
    │    Called once per interview start request                 │
    │    Result: CandidateMemoryContext (topics, trends, focus)  │
    │    ↓                                                       │
    │    Prompt Builder                                          │
    │    ↓                                                       │
    │    Gemini Question Generation                              │
    │                                                            │
    │                                                            │
    ├─── recall() ──────────────────────────────────────────────┘
    │    Purpose: historical evaluation context
    │    Called once per evaluation request
    │    Result: HistoricalEvaluationContext (scores, trends)
    │    ↓
    │    Gemini Evaluation (with history)
    │    ↓
    │    Enhanced Report + historicalProgress
    │
    ├─── validateMemory()
    │    Guards remember() from empty/invalid data
    │
    ├─── remember()
    │    Stores InterviewSemanticMemory to Cognee dataset
    │    Called once per completed interview
    │
    └─── improve()
         Strengthens the knowledge graph
         Called once after every successful remember()


Account Deletion
    └─── forget(userId)
         Deletes the entire Cognee dataset
         Called from deleteClerkUserFromDatabase()
         and DELETE /api/cognee/forget
```

---

## 3. File Map

```
lib/cognee/
  client.ts         HTTP singleton — all Cognee Cloud HTTP requests
  logger.ts         Structured logger — [Cognee] prefix, debug gating, timing
  validator.ts      validateMemory() — guards remember() from bad data

services/
  cognee.service.ts  ALL Cognee operations: healthCheck, remember, recall,
                     improve, forget, recallCandidateMemory,
                     recallHistoricalMemory
  memory-builder.service.ts  Converts report → InterviewSemanticMemory
  memory.service.ts  Orchestrates: validate → remember → improve

  promptBuilder.service.ts   Calls recallCandidateMemory() once,
                             builds Gemini question-generation prompt
  interview.service.ts       Calls recallHistoricalMemory() once,
                             evaluates with history

app/api/
  cognee/health/route.ts    GET  — health + smoke test
  cognee/forget/route.ts    DELETE — authenticated forget endpoint

  interview/end/route.ts    POST — evaluate → report → persistInterviewMemory
  reports/generate/route.ts POST — evaluate → report → persistInterviewMemory

  webhook/clerk/route.ts    POST — user.deleted → forget()

lib/auth/
  sync-user.ts  deleteClerkUserFromDatabase() → forget()

lib/ai/
  promptBuilder.ts           buildInterviewGenerationPrompt() + candidate memory
  evaluationPromptBuilder.ts buildHistoricalContextBlock() + comparison instructions
  prompts/evaluation.ts      evaluationSystemPrompt with historicalProgress schema
```

---

## 4. Recall Flow

### 4a. Question-Generation Recall (Phase 4/5)

Called from `services/promptBuilder.service.ts → prepareInterviewPrompt()`.

```
Interview start request
↓
prepareInterviewPrompt(interview)
    ↓
    recallCandidateMemory({ userId, role, company, interviewType })
        ↓
        recall(buildCandidateMemoryQuery(...))   ← POST /api/v1/recall
        ↓
        Filter empty / "no memory found" responses
        ↓
        Extract focus: recurringStrengths, recurringWeaknesses,
                       previouslyMissedTopics, recentRecommendations
        ↓
        Return CandidateMemoryContext
    ↓
    buildInterviewGenerationPrompt({ ..., candidateMemoryText })
        ↓
        Appends "Candidate Memory" section when count > 0
    ↓
    Return prompt string
↓
generateInterviewQuestions(prompt)
```

**Recall called: once.**

### 4b. Historical Evaluation Recall (Phase 6)

Called from `services/interview.service.ts → evaluateInterview()`.

```
Interview end / report generate request
↓
evaluateInterview({ interviewId, userId })
    ↓
    recallHistoricalMemory({ userId, role, interviewType })
        ↓
        recall(buildHistoricalEvaluationQuery(...))  ← POST /api/v1/recall
        ↓
        Filter empty / "no memory found" responses
        ↓
        Extract: previousScores, trends (strengths, weaknesses,
                 communicationTrend, confidenceTrend, improvementAreas, ...)
        ↓
        Return HistoricalEvaluationContext
    ↓
    buildHistoricalContextBlock(historicalMemory)
        ↓
        Returns null when count === 0 (baseline evaluation)
        Returns formatted history block when memories found
    ↓
    buildEvaluationPrompt({ role, qa, historicalContextBlock })
    ↓
    Gemini evaluation
    ↓
    Parse Evaluation + optional historicalProgress
```

**Recall called: once.**

---

## 5. Storage Flow

Called from both `app/api/interview/end/route.ts` and `app/api/reports/generate/route.ts`.

```
persistInterviewMemory(report, { historicalTrend })
    │
    ├─ buildMemory(report, options)
    │     → InterviewSemanticMemory {
    │         userId, interviewId, company, role, interviewType,
    │         scores, strengths, weaknesses, missingTopics,
    │         recommendations, summary, createdAt, historicalTrend?
    │       }
    │
    ├─ validateMemory(memory)
    │     FAIL → logValidationFailed(), return (no Cognee call)
    │     PASS → continue
    │
    ├─ remember(memory)               ← POST /api/v1/remember (multipart)
    │     SUCCESS → logRememberComplete(durationMs)
    │     FAIL    → logRememberFailed(durationMs), return (skip improve)
    │
    └─ improve()                      ← POST /api/v1/improve
          SUCCESS → logImproveComplete(durationMs)
          FAIL    → logImproveFailed(durationMs)  [swallowed]
```

**remember() called: once per completed interview.**
**improve() called: once, immediately after successful remember().**

---

## 6. Deletion Flow

### Via Clerk webhook (automatic on account deletion)

```
POST /api/webhook/clerk  { type: "user.deleted" }
    ↓
    deleteClerkUserFromDatabase(clerkId)
        ↓
        prisma.user.findUnique({ clerkId })  → get internal userId
        ↓
        prisma.user.deleteMany({ clerkId })  ← DB deletion first
        ↓
        forget(userId)                        ← POST /api/v1/forget
            SUCCESS → logForgetComplete(durationMs)
            FAIL    → logForgetFailed(...)  [logged, not re-thrown]
```

### Via API (manual / programmatic)

```
DELETE /api/cognee/forget  { userId }
    ↓
    auth()  → verify Clerk session
    ↓
    prisma.user.findUnique({ clerkId }) → verify userId matches caller
    ↓
    forget(userId)                       ← POST /api/v1/forget
        SUCCESS → 200 { success: true, datasetDeleted: true }
        FAIL    → 500 { error: "..." }   [surfaced to caller]
```

---

## 7. Error Handling Strategy

| Operation | On failure | Interview blocked? |
|-----------|-----------|-------------------|
| `recallCandidateMemory()` | Returns empty context, logs warn | No |
| `recallHistoricalMemory()` | Returns empty context, logs warn | No |
| `validateMemory()` | Logs warn, skips remember | No |
| `remember()` | Logs warn, skips improve | No |
| `improve()` | Logs warn, swallowed | No |
| `forget()` (webhook path) | Logs error, DB deletion still reported | No |
| `forget()` (API path) | Returns 500 to caller | N/A |

**Rule:** Cognee failures are never propagated to the interview or report API response. The application falls back to V1 behaviour (no personalization, no history) whenever Cognee is unavailable.

---

## 8. Fallback Behaviour

| Scenario | Result |
|----------|--------|
| Cognee env vars missing | `CogneeConfigurationError` thrown at service init; caught by callers; empty context returned |
| Cognee API offline / 5xx | fetch throws; caught by service; empty context returned |
| recall() returns 0 results | Empty `CandidateMemoryContext` / `HistoricalEvaluationContext`; no memory section in prompt |
| recall() returns "no memories" phrasing | Filtered by `isUsefulMemoryText()`; treated as 0 results |
| remember() fails | Memory not stored; improve() skipped; interview completes normally |
| improve() fails | Error logged; interview completes normally |
| forget() fails (webhook) | Error logged; DB deletion already committed |

---

## 9. Observability

### Log levels

| Level | When emitted | Production? |
|-------|-------------|-------------|
| `log()` | Lifecycle milestones (recall started, memory stored, etc.) | Yes |
| `debug()` | Verbose details (focus arrays, full prompt text, trend data) | No (dev only) |
| `warn()` | Non-fatal failures (recall failed, remember failed, validation failed) | Yes |
| `error()` | Fatal failures (forget failed) | Yes |

All logs are prefixed `[Cognee]` for grep-ability.

### Timing metrics

Every operation reports wall-clock duration in milliseconds:

```
[Cognee] Recall completed   { purpose: "question-generation", retrieved: 2, duration: "412 ms" }
[Cognee] Memory stored      { interviewId: "...", memoryId: "...", duration: "190 ms" }
[Cognee] Memory graph optimized { duration: "620 ms" }
[Cognee] Memory dataset deleted { userId: "...", duration: "340 ms" }
[Cognee] Gemini evaluation completed { interviewId: "...", duration: "3240 ms" }
```

### Example production log sequence (interview end)

```
[Cognee] Recall started        { purpose: "evaluation-history", userId: "...", role: "Backend Engineer" }
[Cognee] Recall completed      { purpose: "evaluation-history", retrieved: 1, duration: "387 ms" }
[Cognee] Gemini evaluation started  { interviewId: "...", hasHistory: true }
[Cognee] Gemini evaluation completed { interviewId: "...", hasHistoricalProgress: true, duration: "2910 ms" }
[Cognee] Building semantic memory
[Cognee] Remember started      { interviewId: "...", userId: "..." }
[Cognee] Memory stored         { interviewId: "...", memoryId: "...", duration: "210 ms" }
[Cognee] Improve started
[Cognee] Memory graph optimized { duration: "580 ms" }
```

### Example production log sequence (interview start — no prior memory)

```
[Cognee] Recall started  { purpose: "question-generation", userId: "...", role: "Backend Engineer" }
[Cognee] Recall completed { purpose: "question-generation", retrieved: 0, duration: "290 ms" }
[Cognee] Prompt ready    { hasCandidateMemory: false, promptLength: 1842, duration: "312 ms" }
```

---

## 10. Memory Validation

`validateMemory()` in `lib/cognee/validator.ts` runs before every `remember()` call.

Required fields:
- `userId` — non-empty string
- `interviewId` — non-empty string
- `strengths` — array (may be empty)
- `weaknesses` — array (may be empty)
- `recommendations` — array (may be empty)
- `scores.overall` — if provided, must be 0–100

Semantic content check: at least one of strengths, weaknesses, recommendations, or scores.overall must be present. An interview with zero content on all dimensions is skipped.

On failure:
```
[Cognee] Memory validation failed — skipping remember()
         { interviewId: "...", issues: ["userId is missing or empty"] }
```

---

## 11. Environment Variables

```env
COGNEE_BASE_URL=https://api.cognee.ai
COGNEE_API_KEY=your_cognee_cloud_api_key
COGNEE_TENANT_ID=your_cognee_tenant_id
COGNEE_USER_ID=your_cognee_dataset_name
```

Notes:
- `COGNEE_USER_ID` is the Cognee dataset name that all memories are stored under.
- When Cognee env vars are absent, `getCogneeClient()` throws `CogneeConfigurationError` which is caught by all service-layer callers and treated as an empty-result fallback.
- Authentication uses `X-Api-Key` header, not `Bearer`.

---

## 12. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/cognee/health` | GET | Health check + smoke test (remember + recall) |
| `/api/cognee/forget` | DELETE | Permanently remove all user memories |
| `/api/interview/end` | POST | Evaluate → report → remember → improve |
| `/api/reports/generate` | POST | Evaluate → report → remember → improve |
| `/api/webhook/clerk` | POST | `user.deleted` → forget() |

---

## 13. Final Verification Checklist

- [x] All Cognee calls go through `services/cognee.service.ts`
- [x] `recall()` called exactly once per interview-start request (in `prepareInterviewPrompt`)
- [x] `recall()` called exactly once per evaluation request (in `evaluateInterview`)
- [x] `remember()` called exactly once per completed interview (in `persistInterviewMemory`)
- [x] `improve()` called exactly once after every successful `remember()`
- [x] `forget()` removes the Cognee dataset on account deletion
- [x] All Cognee failures are non-blocking — interview flow unaffected
- [x] Structured `[Cognee]` logging on every operation
- [x] Timing metrics on recall, remember, improve, forget, and evaluation
- [x] `validateMemory()` guards `remember()` from empty/invalid data
- [x] Debug-level verbose logs suppressed in production
- [x] `[MVP REPORT]` dev log removed from `/api/interview/end`
- [x] Legacy dead code (`rememberEvaluation`, `getMemory`, `queryMemory`) removed
- [x] Legacy stub memory routes (`/api/memory/timeline`, `/api/memory/insights`) return `501`
- [x] Zero TypeScript errors (`npm run typecheck` passes)
