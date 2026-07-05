# Cognee Integration Handoff

This document summarizes the Cognee integration implemented so far in the AI Interview Platform. It is intended for future agents/engineers so they can understand the current architecture and continue safely.

## High-level status

Completed phases:

- Phase 1: Cognee Cloud connection
- Phase 2: Memory Builder
- Phase 3: Persist semantic interview memory into Cognee
- Phase 4: Retrieve candidate memory before Gemini question generation
- Phase 5: Adaptive interview personalization using Cognee memory
- Phase 6: Longitudinal Evaluation & Memory Evolution
- Phase 7: Cognee Memory Lifecycle (improve() & forget())

Not implemented yet:

- automatic memory weighting updates
- memory pruning
- advanced per-user dataset isolation beyond the current configured Cognee dataset
- analytics/report memory visualization

## Important constraints

Cognee is an enhancement layer. The core interview flow must continue even if Cognee fails.

Do not break or replace:

- Resume context
- User profile context
- Job description context
- Gemini question generation
- Deepgram voice agent
- Database schema
- Report generation

Cognee memory should personalize interviews, not dominate them.

## Environment variables

Required in `.env.local`:

```env
COGNEE_BASE_URL=https://api.cognee.ai
COGNEE_API_KEY=your_cognee_cloud_api_key
COGNEE_TENANT_ID=your_cognee_tenant_id
COGNEE_USER_ID=your_cognee_dataset_name
```

Notes:

- `COGNEE_BASE_URL` for Cognee Cloud is `https://api.cognee.ai`.
- `COGNEE_API_KEY` is sent using the `X-Api-Key` header.
- Do not prefix the API key with `Bearer`.
- `COGNEE_USER_ID` is currently used as the Cognee `datasetName` for `remember()` and `recall()`.

## Phase 1: Cognee connection

### Main files

- `lib/cognee/client.ts`
- `services/cognee.service.ts`
- `app/api/cognee/health/route.ts`

### What exists

`lib/cognee/client.ts` exports:

```ts
getCogneeClient()
```

Responsibilities:

- validates required Cognee env vars
- initializes a singleton Cognee client
- wraps Cognee Cloud HTTP requests
- sends API key via `X-Api-Key`
- throws meaningful configuration/request errors

`services/cognee.service.ts` exports:

```ts
healthCheck()
remember(memory)
recall(query)
recallCandidateMemory(params)
```

The health endpoint:

```txt
GET /api/cognee/health
```

Flow:

1. Calls Cognee `/health`
2. Calls `remember("Hello Cognee. This is a connection test.")`
3. Calls `recall("hello")`
4. Logs the recall response
5. Returns `{ "success": true }` if the memory can be recalled

### Health test

Start the app:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000/api/cognee/health
```

Expected:

```json
{
  "success": true
}
```

## Phase 2: Memory Builder

### Main file

- `services/memory-builder.service.ts`

### Purpose

Converts a generated interview report into a clean semantic memory object.

It does not:

- call Cognee
- write to the database
- create API routes
- use resume/transcript/audio/questions

### Main export

```ts
buildMemory(report)
```

Also exports helper functions:

```ts
buildScoreMemory()
buildStrengthMemory()
buildWeaknessMemory()
buildMissingTopicMemory()
buildRecommendationMemory()
buildSummary()
```

### Output shape

```ts
type InterviewSemanticMemory = {
  userId: string | null;
  interviewId: string | null;
  company: string | null;
  role: string | null;
  interviewType: string | null;
  scores: {
    overall: number | null;
    technical: number | null;
    communication: number | null;
    behavioral: number | null;
    problemSolving: number | null;
    confidence: number | null;
  };
  strengths: string[];
  weaknesses: string[];
  missingTopics: string[];
  recommendations: string[];
  summary: string | null;
  createdAt: string | null;
};
```

Missing fields are handled gracefully as `null` or `[]`.

### Mock test

```bash
npx tsx -e "import { buildMemory } from './services/memory-builder.service'; const report = { userId: 'user_123', interviewId: 'interview_123', overallScore: 84, technicalScore: 82, communicationScore: 88, behavioralScore: 76, problemSolvingScore: 80, confidenceScore: 85, strengths: ['Node.js', 'Express', 'Redis'], weaknesses: ['Dynamic Programming', 'Operating Systems'], missingTopics: ['Graphs'], recommendations: ['Practice Dynamic Programming'], createdAt: new Date(), interview: { company: 'Google', role: 'Backend Engineer', interviewType: 'Technical' } }; console.log(JSON.stringify(buildMemory(report), null, 2));"
```

On PowerShell, use `npx.cmd` if script execution is blocked.

## Phase 3: Persist semantic interview memory into Cognee

### Main files

- `services/cognee.service.ts`
- `services/memory.service.ts`
- `app/api/interview/end/route.ts`
- `app/api/reports/generate/route.ts`

### Flow

After report generation:

```txt
Report generated
↓
buildMemory(report)
↓
remember(memory)
↓
Cognee Cloud
```

### Where it is called

`services/memory.service.ts` exports:

```ts
persistInterviewMemory(report)
```

It is called after `saveReport()` in:

- `app/api/interview/end/route.ts`
- `app/api/reports/generate/route.ts`

### Error handling

`persistInterviewMemory()` catches all Cognee errors internally.

If Cognee fails:

- logs `[Cognee] Remember failed`
- does not throw
- does not rollback report generation
- does not fail interview completion

### Logs

Expected success logs:

```txt
[Cognee] Building semantic memory...
[Cognee] Memory created { ... }
[Cognee] Calling remember()...
[Cognee] Memory stored successfully { interviewId: "...", memoryId: "..." }
```

Expected failure logs:

```txt
[Cognee] Remember failed { reason: "..." }
```

### Direct persistence test

This stores one real test memory in Cognee Cloud:

```bash
npx tsx --env-file=.env.local -e "import { persistInterviewMemory } from './services/memory.service'; async function main() { await persistInterviewMemory({ userId: 'phase3-test-user', interviewId: 'phase3-test-interview-' + Date.now(), overallScore: 84, technicalScore: 82, communicationScore: 88, behavioralScore: 79, problemSolvingScore: 80, confidenceScore: 86, strengths: ['Node.js', 'Redis', 'Express'], weaknesses: ['Dynamic Programming', 'Operating Systems'], missingTopics: ['Graphs'], recommendations: ['Practice Dynamic Programming', 'Revise Operating Systems'], createdAt: new Date(), interview: { userId: 'phase3-test-user', company: 'Google', role: 'Backend Engineer', interviewType: 'Technical' } }); } main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });"
```

PowerShell-safe form:

```powershell
npx.cmd tsx --env-file=.env.local -e "import { persistInterviewMemory } from './services/memory.service'; async function main() { await persistInterviewMemory({ userId: 'phase3-test-user', interviewId: 'phase3-test-interview-' + Date.now(), overallScore: 84, technicalScore: 82, communicationScore: 88, behavioralScore: 79, problemSolvingScore: 80, confidenceScore: 86, strengths: ['Node.js', 'Redis', 'Express'], weaknesses: ['Dynamic Programming', 'Operating Systems'], missingTopics: ['Graphs'], recommendations: ['Practice Dynamic Programming', 'Revise Operating Systems'], createdAt: new Date(), interview: { userId: 'phase3-test-user', company: 'Google', role: 'Backend Engineer', interviewType: 'Technical' } }); } main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });"
```

## Phase 4: Retrieve candidate memory before Gemini question generation

### Main files

- `services/cognee.service.ts`
- `services/promptBuilder.service.ts`
- `lib/ai/promptBuilder.ts`

### Flow

Current question-generation flow now includes memory retrieval:

```txt
Interview Start
↓
Load Resume
↓
Load User Profile
↓
Load Job Description
↓
Cognee recallCandidateMemory()
↓
Prompt Builder receives candidate memory
↓
Gemini generates questions
```

### Where recall happens

`services/promptBuilder.service.ts` calls:

```ts
recallCandidateMemory({
  userId: interview.userId,
  role: interview.role,
  company: interview.customCompanyName || interview.company,
  interviewType: interview.interviewType,
});
```

`recallCandidateMemory()` lives in:

```txt
services/cognee.service.ts
```

It calls the lower-level:

```ts
recall(query)
```

### Query intent

The recall query asks Cognee for relevant semantic memory only:

- recurring technical strengths
- recurring technical weaknesses
- missing topics
- previous recommendations
- communication trends

It explicitly excludes:

- raw transcripts
- resume text
- job descriptions
- audio
- interview questions

### Prompt injection

`lib/ai/promptBuilder.ts` now accepts:

```ts
candidateMemoryText?: string
```

When present, it appends:

```txt
--------------------------------
Previous Interview Memory

...

Memory personalization rules:
- Use previous interview memory to personalize the interview.
- If a topic appears mastered recently, avoid beginner-level repeats.
- If a weakness appears repeatedly, increase focus on that topic.
- If communication has improved, increase technical depth.
- Do not repeat identical questions from previous interviews unless reinforcement is clearly beneficial.
- Memory should guide personalization, not dominate the interview.
- Resume and Job Description remain the primary sources.
--------------------------------
```

### Error handling

If Cognee recall fails:

- logs `[Cognee] Recall failed`
- returns empty memory context
- prompt builder skips the memory section
- Gemini question generation continues normally

No interview creation should fail because Cognee is unavailable.

### Logs

Expected logs during question generation:

```txt
[Cognee] Recall started... { userId, role, company, interviewType }
[Cognee] Retrieved 1 relevant memories
[Cognee] Retrieved Memory { count: 1, memory: "..." }
[Cognee] Passing memory to Prompt Builder { hasMemory: true }
[Cognee] Prompt Builder completed { hasCandidateMemory: true, promptLength: 5421 }
[Prompt Builder] Final Prompt ...
```

`[Prompt Builder] Final Prompt` logs only when `NODE_ENV !== "production"`.

### Direct recall test

```bash
npx tsx --env-file=.env.local -e "import { recallCandidateMemory } from './services/cognee.service'; async function main() { const result = await recallCandidateMemory({ userId: 'phase3-test-user', role: 'Backend Engineer', company: 'Google', interviewType: 'Technical' }); console.log(JSON.stringify(result, null, 2)); } main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });"
```

Expected result should include memories such as:

```txt
Node.js
Redis
Express
Dynamic Programming
Operating Systems
Graphs
```

## Phase 5: Adaptive interview personalization using Cognee memory

### Main files

- `services/cognee.service.ts`
- `services/promptBuilder.service.ts`
- `services/questionGenerator.service.ts`
- `lib/ai/promptBuilder.ts`

### Purpose

Phase 5 makes retrieved Cognee memory actively influence Gemini question generation. The interview flow is unchanged; only the prompt context and instructions are more adaptive.

### What changed

`recallCandidateMemory()` now asks Cognee for a concise adaptive memory profile using these headings when evidence exists:

```txt
Recurring Strengths
Recurring Weaknesses
Previously Practiced Topics
Previously Missed Topics
Communication Trend
Confidence Trend
Improvement Since Last Interview
Areas Still Needing Practice
Recent Recommendations
```

It also derives a lightweight local `focus` object for logging:

```ts
{
  recurringStrengths: string[];
  recurringWeaknesses: string[];
  previouslyMissedTopics: string[];
  recentRecommendations: string[];
}
```

This is only used for observability/logging. It is not stored and does not update memory weights.

### Adaptive prompt behavior

When Candidate Memory exists, `buildInterviewGenerationPrompt()` appends a dedicated adaptive section:

```txt
--------------------------------
Candidate Memory

Use this concise history to adapt topic selection, depth, and follow-up style.
It is secondary context: Resume, Job Description, and Interview Configuration remain primary.

Memory 1:
...

Adaptive personalization instructions for Gemini:
- Preserve the existing interview rules, company template, interview type, and total question count.
- Use Candidate Memory only to choose WHICH DSA, Core CS, backend, behavioral, or system-design topics to emphasize.
- Focus more heavily on recurring weaknesses and previously missed topics. If relevant to the role/JD, include at least one discussion question that revisits a recurring weakness.
- For recurring strengths, avoid beginner questions. Ask deeper architecture, scalability, debugging, trade-off, production, or edge-case questions instead.
- If prior recommendations appear addressed, verify improvement with a more advanced or applied version rather than repeating the identical question.
- If communication or confidence has improved, increase technical depth and reduce easy resume-only questions.
- If previous interviews showed excellent performance in a topic, reduce its weight and allocate more attention to weaker areas.
- Avoid repeating identical interview questions unless intentional reinforcement is clearly beneficial.
- Memory should personalize the interview, not dominate it.
--------------------------------
```

### Example behavior change

If Candidate Memory says:

```txt
Recurring Strengths
- Node.js
- Express
- REST APIs

Recurring Weaknesses
- Dynamic Programming
- Operating Systems

Previously Missed Topics
- Graphs

Recent Recommendations
- Practice Dynamic Programming
- Revise Operating Systems
```

Gemini should still follow the existing FAANG/technical distribution, but it should choose more targeted topics:

Before personalization:

```txt
- Ask a medium array/string DSA question.
- Ask a basic REST API question.
- Ask a general resume project question.
```

After personalization:

```txt
- Prefer a graph or dynamic-programming discussion instead of another array question.
- Ask an Operating Systems concurrency/scheduling discussion if relevant.
- Avoid basic REST questions; ask about API scalability, failure handling, idempotency, rate limits, or production debugging.
- Revisit Redis/Dynamic Programming recommendations as applied improvement checks rather than repeating identical questions.
```

### Logs

Expected logs now include:

```txt
[Cognee] Retrieved Memory { count: 1, memory: "..." }
[Cognee] Personalization Summary { recurringWeaknesses: [...], recurringStrengths: [...] }
[Cognee] Weakness Focus: Dynamic Programming, Operating Systems
[Cognee] Strength Focus: Node.js, Express, REST APIs
[Cognee] Passing memory to Prompt Builder { hasMemory: true }
[Cognee] Prompt Builder Updated { hasCandidateMemory: true, promptLength: 6500 }
[Cognee] Gemini Generation Started { interviewId: "...", promptLength: 6500 }
```

### Fallback behavior

If Cognee returns no usable memory or recall fails:

- `count` is `0`
- `formatted` is `null`
- the Candidate Memory section is not added
- Gemini receives the same resume/profile/job-description prompt as before
- interview generation continues

No `improve()`, `forget()`, pruning, or automatic memory weighting was added.

## Phase 6: Longitudinal Evaluation & Memory Evolution

### Main files

- `services/cognee.service.ts` — `recallHistoricalMemory()` and supporting types
- `lib/ai/evaluationPromptBuilder.ts` — `buildHistoricalContextBlock()` and `buildEnhancedEvaluationPrompt()`
- `lib/ai/prompts/evaluation.ts` — updated `evaluationSystemPrompt` with `historicalProgress` schema, updated `buildEvaluationPrompt()`
- `services/interview.service.ts` — `evaluateInterview()` calls recall before Gemini
- `services/memory-builder.service.ts` — `buildMemory()` includes `historicalTrend`
- `services/memory.service.ts` — `persistInterviewMemory()` passes `historicalTrend` into stored memory
- `types/report.ts` — `HistoricalProgress`, `HistoricalProgressTrend`, `Evaluation.historicalProgress?`
- `app/api/interview/end/route.ts` — passes `historicalTrend` to `persistInterviewMemory()`
- `app/api/reports/generate/route.ts` — passes `historicalTrend` to `persistInterviewMemory()`

### Goal

Use previous Cognee memories during **Gemini Evaluation** to compare the current interview against historical interviews and produce a **Historical Progress** section in the generated report.

This phase does NOT change the interview flow itself.

### New flow

```txt
Interview
↓
Deepgram Voice Agent
↓
Cognee.recallHistoricalMemory()          ← Phase 6 (new)
↓
Historical Memory context block          ← Phase 6 (new)
↓
Gemini Evaluation (with history)         ← Phase 6 (enriched)
↓
Enhanced Report + historicalProgress     ← Phase 6 (new field)
↓
Memory Builder (with historicalTrend)    ← Phase 6 (enriched)
↓
Cognee.remember()
```

### Where recall() is called during evaluation

`services/interview.service.ts` → `evaluateInterview()`:

```ts
const historicalMemory = await recallHistoricalMemory({
  userId,
  role: interview.role,
  interviewType: interview.interviewType ?? undefined,
});
const historicalContextBlock = buildHistoricalContextBlock(historicalMemory);
```

This happens **before** `complete()` is called with the Gemini prompt, so the history is always injected into the evaluation — not after.

### `recallHistoricalMemory()` — evaluation-specific recall

Lives in `services/cognee.service.ts`.  Intentionally separate from `recallCandidateMemory()` (which drives question personalization).

Query focus:

- Previous scores (overall, technical, communication, confidence, behavioral, problem-solving)
- Recurring strengths and weaknesses across sessions
- Communication trend and confidence trend
- Topics that were previously weak but improved
- Topics repeatedly recommended but unresolved
- Topics mastered (no need to re-test)
- Improvement summary since last interview

Returns `HistoricalEvaluationContext`:

```ts
{
  memories: string[];
  formatted: string | null;
  count: number;
  previousScores: {
    overall: number | null;
    technical: number | null;
    communication: number | null;
    confidence: number | null;
    behavioral: number | null;
    problemSolving: number | null;
  };
  trends: {
    recurringStrengths: string[];
    recurringWeaknesses: string[];
    communicationTrend: string | null;
    confidenceTrend: string | null;
    improvementAreas: string[];
    stillNeedsWork: string[];
    previousRecommendations: string[];
  };
}
```

### Example historical memory injected into Gemini

```txt
--------------------------------
Historical Candidate Memory

Use the following context ONLY to compare the candidate's current
performance against their historical trends.  Do NOT hallucinate
previous interviews.  Do NOT rewrite history.  If an area is not
mentioned below, treat it as unknown.

Previous Scores (most recent):
  Overall:         78/100
  Technical:       74/100
  Communication:   80/100
  Confidence:      72/100
  Behavioral:      78/100
  Problem-Solving: 68/100

Recurring Strengths:
  - Node.js
  - Express
  - REST APIs

Recurring Weaknesses:
  - Dynamic Programming
  - Operating Systems

Communication Trend:
  Improving — went from Average to Good across last two sessions

Confidence Trend:
  Moderate, slight upward movement

Previously Improved Areas:
  - Redis
  - API Design

Topics Still Needing Work:
  - Dynamic Programming
  - Graphs

Previous Recommendations (to track whether followed):
  - Practice DP on LeetCode
  - Revise OS scheduling concepts

Full Historical Records (for deeper context):
Historical Record 1:
...
--------------------------------

Historical Comparison Instructions:
- Compare the current interview performance against the historical records above.
- Identify improvements, regressions, stable strengths.
...
```

### Example `historicalProgress` section in the report

```json
{
  "historicalProgress": {
    "improvedAreas": ["Redis", "API Design"],
    "regressedAreas": [],
    "stableStrengths": ["Node.js", "Express"],
    "stillNeedsImprovement": ["Dynamic Programming", "Operating Systems"],
    "communication": {
      "previous": "Average",
      "current": "Good"
    },
    "confidence": {
      "previous": "Moderate",
      "current": "High"
    },
    "overallTrend": "Candidate has shown steady improvement across backend engineering interviews. Redis and API Design are now solid. Dynamic Programming remains the primary gap requiring dedicated practice."
  }
}
```

### Example updated memory stored in Cognee

After each interview the stored `InterviewSemanticMemory` object now includes:

```json
{
  "userId": "user_123",
  "interviewId": "interview_456",
  "company": "Google",
  "role": "Backend Engineer",
  "interviewType": "Technical",
  "scores": {
    "overall": 84,
    "technical": 82,
    "communication": 88,
    "behavioral": 76,
    "problemSolving": 80,
    "confidence": 85
  },
  "strengths": ["Node.js", "Express", "Redis", "API Design"],
  "weaknesses": ["Dynamic Programming", "Operating Systems"],
  "missingTopics": ["Graphs"],
  "recommendations": ["Practice DP", "Revise OS scheduling"],
  "summary": "Candidate shows strong interview readiness for the Backend Engineer role. Strengths include Node.js, Express, Redis, and API Design. Improvement areas include Dynamic Programming, Operating Systems, and Graphs.",
  "historicalTrend": "Candidate has shown steady improvement across backend engineering interviews. Redis and API Design are now solid. Dynamic Programming remains the primary gap requiring dedicated practice.",
  "createdAt": "2026-07-05T15:00:00.000Z"
}
```

The `historicalTrend` field means each subsequent `recallHistoricalMemory()` call will surface the evolving trend summary, making the graph progressively richer.

### Evaluation without Cognee (graceful fallback)

When `recallHistoricalMemory()` fails or returns zero memories:

- `historicalContextBlock` is `null`
- `buildEvaluationPrompt()` generates the same prompt as before Phase 6
- Gemini evaluates exactly as today — no `historicalProgress` field in output
- `persistInterviewMemory()` stores the memory without `historicalTrend`
- The interview/report flow completes normally

Cognee remains an enhancement layer. Zero Cognee failures propagate to the user.

### New types

```ts
// types/report.ts
interface HistoricalProgressTrend {
  previous: string;
  current: string;
}

interface HistoricalProgress {
  improvedAreas: string[];
  regressedAreas: string[];
  stableStrengths: string[];
  stillNeedsImprovement: string[];
  communication?: HistoricalProgressTrend;
  confidence?: HistoricalProgressTrend;
  overallTrend: string;
}

// historicalProgress is optional on Evaluation — existing reports compatible
interface Evaluation {
  // ... existing fields ...
  historicalProgress?: HistoricalProgress;
}
```

### New logs

When historical memory is found:

```txt
[Cognee] Retrieving historical interview memory...
[Cognee] Historical memory loaded { count: 1, hasPreviousScores: true }
[Cognee] Passing historical memory to evaluation { recurringWeaknesses: [...], recurringStrengths: [...] }
[Cognee] Gemini evaluation completed { interviewId: "..." }
[Cognee] Historical comparison generated { improvedAreas: [...], stableStrengths: [...], overallTrend: "..." }
[Cognee] Building semantic memory...
[Cognee] Memory created { ..., hasHistoricalTrend: true }
[Cognee] Calling remember()...
[Cognee] Updated semantic memory stored { interviewId: "...", memoryId: "..." }
```

When no history exists (baseline):

```txt
[Cognee] Retrieving historical interview memory...
[Cognee] No historical memory — evaluating as baseline
[Cognee] Gemini evaluation completed { interviewId: "..." }
[Cognee] Building semantic memory...
[Cognee] Memory created { ..., hasHistoricalTrend: false }
[Cognee] Calling remember()...
[Cognee] Updated semantic memory stored { interviewId: "...", memoryId: "..." }
```

### Phase 6 end-to-end test plan

1. Ensure `.env.local` has Cognee variables.
2. Run `npm run dev`.
3. **Interview 1** — first interview for a user.
   - Confirm: `[Cognee] No historical memory — evaluating as baseline`
   - Report has NO `historicalProgress` field.
   - Memory is stored with `hasHistoricalTrend: false`.
4. **Interview 2** — same user, same role.
   - Confirm: `[Cognee] Historical memory loaded { count: 1 }`
   - Confirm: `[Cognee] Historical comparison generated { ... }`
   - Report DOES have `historicalProgress` with `overallTrend` text.
   - Memory is stored with `hasHistoricalTrend: true`.
5. **Interview 3** — same user, same role.
   - Confirm: accumulated memory is recalled.
   - Improvements detected from Interview 2 are reflected.
   - Regressions detected if applicable.
   - `overallTrend` references multi-interview trajectory.

Verify:

- Improvements are detected when a previously weak area scores well.
- Regressions are detected when a previously strong area scores poorly.
- Stable strengths remain consistent across sessions.
- Recommendations evolve instead of repeating unchanged advice.

### Direct historical recall test

```powershell
npx.cmd tsx --env-file=.env.local -e "import { recallHistoricalMemory } from './services/cognee.service'; async function main() { const result = await recallHistoricalMemory({ userId: 'phase3-test-user', role: 'Backend Engineer', interviewType: 'Technical' }); console.log(JSON.stringify(result, null, 2)); } main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });"
```

### Readiness for the final Cognee lifecycle phase

Phase 6 creates the complete memory loop:

```txt
recall history → evaluate with history → generate historicalProgress →
store memory with historicalTrend → next recall sees the trend
```

This makes the graph continuously richer with each interview.

The final phase (`improve()` / `forget()`) can now operate on this evolving graph to:

- Reinforce confirmed improvements
- Prune stale or contradicted memories
- Merge repeated weaknesses into weighted nodes
- Support user-facing memory management

All the stored data structures (`historicalTrend`, `historicalProgress`) are in place to inform those operations.

## Phase 7: Cognee Memory Lifecycle (improve() & forget())

### Main files

- `services/cognee.service.ts` — `improve()` and `forget()` added
- `services/memory.service.ts` — `persistInterviewMemory()` calls `improve()` after `remember()`
- `app/api/cognee/forget/route.ts` — `DELETE /api/cognee/forget` endpoint
- `lib/auth/sync-user.ts` — `deleteClerkUserFromDatabase()` calls `forget()` on account deletion

### Goal

Complete the Cognee memory lifecycle:

- `improve()` — called after every successful `remember()` to strengthen the graph
- `forget()` — called when a user permanently deletes their account

### New flow: improve()

```txt
Interview
↓
Gemini Evaluation
↓
Report
↓
Memory Builder
↓
remember()           ← Phase 3 (existing)
↓
improve()            ← Phase 7 (new)
↓
END
```

### New flow: forget()

```txt
User deletes account (Clerk user.deleted webhook)
↓
deleteClerkUserFromDatabase()
  └─ prisma.user.deleteMany()    ← delete DB records first
  └─ forget(userId)              ← Phase 7 (new)
       └─ POST /api/v1/forget { dataset: clientUserId }
↓
All Cognee memories removed
```

### Part 1 — improve()

#### Where it is called

`services/memory.service.ts` → `persistInterviewMemory()`:

```ts
// After remember() succeeds:
console.log("[Cognee] Running improve()...");
try {
  await improveInCognee();
  console.log("[Cognee] Memory graph optimized");
} catch (improveReason) {
  console.error("[Cognee] Improve failed", { reason: ... });
  // intentionally swallowed
}
```

#### Cognee API call

```
POST /api/v1/improve
{
  "datasetName": "<COGNEE_USER_ID>",
  "runInBackground": false
}
```

#### Error handling

`improve()` failures are caught inside `persistInterviewMemory()`.  They are logged but never re-thrown.  The interview completes normally regardless.

#### Example improve() logs — success

```txt
[Cognee] Building semantic memory...
[Cognee] Memory created { userId: "...", interviewId: "...", hasHistoricalTrend: true }
[Cognee] Calling remember()...
[Cognee] Updated semantic memory stored { interviewId: "...", memoryId: "..." }
[Cognee] Running improve()...
[Cognee] Memory graph optimized
```

#### Example improve() logs — failure (interview still completes)

```txt
[Cognee] Updated semantic memory stored { interviewId: "...", memoryId: "..." }
[Cognee] Running improve()...
[Cognee] Improve failed { reason: "Cognee request failed (409 Conflict) ..." }
```

### Part 2 — forget()

#### `forget()` in `services/cognee.service.ts`

```ts
export async function forget(userId: string): Promise<ForgetResult> {
  // Calls POST /api/v1/forget with the configured dataset name.
  // Throws on failure so callers can surface errors to users.
}
```

Cognee API call:

```
POST /api/v1/forget
{
  "dataset": "<COGNEE_USER_ID>",
  "everything": false
}
```

#### Where forget() is called

**1. `lib/auth/sync-user.ts` — automatic on Clerk `user.deleted` webhook:**

```ts
export async function deleteClerkUserFromDatabase(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  const result = await prisma.user.deleteMany({ where: { clerkId } });

  if (user) {
    try {
      await forget(user.id);
    } catch (reason) {
      // logged, never re-thrown — DB deletion is already committed
    }
  }

  return result;
}
```

**2. `DELETE /api/cognee/forget` — manual or programmatic account deletion:**

```txt
DELETE /api/cognee/forget
Content-Type: application/json
Authorization: <Clerk session>

{ "userId": "<internal app userId>" }
```

#### `DELETE /api/cognee/forget` response

Success:

```json
{
  "ok": true,
  "data": {
    "success": true,
    "datasetDeleted": true,
    "message": "Cognee memory dataset \"<dataset>\" deleted for user <userId>."
  }
}
```

Failure (e.g. Cognee unavailable):

```json
{
  "ok": false,
  "error": "Cognee request failed (500 ...) ..."
}
```

#### Security

The `DELETE /api/cognee/forget` route:

- Requires Clerk authentication (`auth()`)
- Resolves the authenticated user's internal `userId` from the database
- Rejects with `403` if the `userId` in the request body does not match the authenticated user
- This prevents cross-user memory deletion

#### forget() error handling

In `lib/auth/sync-user.ts`: `forget()` errors are caught and logged.  The DB deletion result is still returned to the Clerk webhook correctly.

In `app/api/cognee/forget/route.ts`: `forget()` errors are NOT swallowed — they surface as a `500` response so callers know the Cognee deletion failed and can retry or alert.

#### Example forget() logs

Success (via webhook):

```txt
[Cognee] Deleting Cognee memory for deleted user { userId: "...", clerkId: "..." }
[Cognee] forget() called { userId: "...", dataset: "..." }
[Cognee] Memory dataset deleted { userId: "...", dataset: "..." }
[Cognee] Cognee memory deleted for user { userId: "..." }
```

Failure (via webhook — DB deletion still succeeds):

```txt
[Cognee] forget() called { userId: "...", dataset: "..." }
[Cognee] forget() failed during account deletion { userId: "...", reason: "..." }
```

### Confirmation: interview completion with improve() failure

`improve()` is called inside a `try/catch` block that is itself inside the outer `persistInterviewMemory()` `try/catch`.  Even if `improve()` throws, the error is swallowed and only logged.  The interview/report API routes (`/api/interview/end` and `/api/reports/generate`) call `persistInterviewMemory()` non-blockingly and never depend on its return value for the success response.  Interview completion always succeeds.

### Confirmation: recall() returns no memories after forget()

`forget()` calls `POST /api/v1/forget` with `dataset: client.userId` and `everything: false`, which deletes the entire dataset including graph nodes, vector embeddings, and raw stored files.  After this call, `recall()` queries against `[client.userId]` will find no stored memories and return an empty array, causing `recallCandidateMemory()` and `recallHistoricalMemory()` to return empty/null contexts.

### Test commands

**Test improve():**

Complete an interview and confirm these log lines appear in order:

```txt
[Cognee] Updated semantic memory stored
[Cognee] Running improve()...
[Cognee] Memory graph optimized
```

**Test forget():**

```powershell
# 1. Store test memories first (Phase 3 test)
npx.cmd tsx --env-file=.env.local -e "..."

# 2. Call forget endpoint
curl -X DELETE http://localhost:3000/api/cognee/forget \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <clerk_token>" \
  -d '{"userId":"<your_user_id>"}'

# 3. Verify no memories remain
npx.cmd tsx --env-file=.env.local -e "import { recallCandidateMemory } from './services/cognee.service'; async function main() { const r = await recallCandidateMemory({ userId: 'your-user-id', role: 'Backend Engineer' }); console.log('memories after forget:', r.count); } main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });"
```

Expected: `memories after forget: 0`

## Validation commands

Run typecheck:

```bash
npm run typecheck
```

Run targeted lint for Cognee integration files:

```bash
npx eslint services/cognee.service.ts services/memory.service.ts services/memory-builder.service.ts services/promptBuilder.service.ts services/questionGenerator.service.ts lib/ai/promptBuilder.ts app/api/interview/end/route.ts app/api/reports/generate/route.ts
```

Known note: full project lint may fail due pre-existing unrelated lint issues outside the Cognee integration.

## Current integration map

```txt
lib/cognee/client.ts
  Cognee HTTP singleton/client

services/cognee.service.ts
  healthCheck()
  remember()
  recall()
  improve()                          ← Phase 7 (new)
  forget(userId)                     ← Phase 7 (new)
  recallCandidateMemory()            ← Phase 4/5: question-generation recall
  recallHistoricalMemory()           ← Phase 6: evaluation-context recall

lib/ai/evaluationPromptBuilder.ts   ← Phase 6 (new)
  buildHistoricalContextBlock()
  buildEnhancedEvaluationPrompt()

lib/ai/prompts/evaluation.ts        ← Phase 6 (updated)
  evaluationSystemPrompt             historicalProgress schema added
  buildEvaluationPrompt()            now accepts historicalContextBlock

services/memory-builder.service.ts
  buildMemory(report, options?)      ← Phase 6: accepts historicalTrend option
  semantic report-to-memory conversion

services/memory.service.ts
  persistInterviewMemory(report, options?)
    remember() → improve()           ← Phase 7: improve() called after remember()

services/promptBuilder.service.ts
  prepareInterviewPrompt(interview)
  recalls memory before building Gemini question-generation prompt

lib/ai/promptBuilder.ts
  buildInterviewGenerationPrompt(...)
  appends adaptive Candidate Memory section

types/report.ts
  HistoricalProgress                 ← Phase 6 (new)
  HistoricalProgressTrend            ← Phase 6 (new)
  Evaluation.historicalProgress?     ← Phase 6 (new optional field)

lib/auth/sync-user.ts
  deleteClerkUserFromDatabase()
    prisma.user.deleteMany() → forget(userId)  ← Phase 7: Cognee cleanup on deletion

app/api/cognee/health/route.ts
  Phase 1 health + remember/recall smoke test

app/api/cognee/forget/route.ts     ← Phase 7 (new)
  DELETE /api/cognee/forget
  authenticated, cross-user protected, calls forget(userId)

app/api/interview/end/route.ts
  saves report → persistInterviewMemory() → remember() → improve()

app/api/reports/generate/route.ts
  saves report → persistInterviewMemory() → remember() → improve()

app/api/webhook/clerk/route.ts
  user.deleted → deleteClerkUserFromDatabase() → forget()
```

## Recommended future work

### Future phase ideas

Possible next steps, depending on product direction:

1. Add safer per-user/per-candidate memory scoping.
   - Current dataset is controlled by `COGNEE_USER_ID`.
   - Future work may create per-user datasets or use `node_set`/metadata to isolate memories.

2. Add a manual debug endpoint for memory recall.
   - Useful for QA only.
   - Should be protected and not exposed publicly.

3. Add more robust structured memory aggregation.
   - Current recall asks Cognee to return structured sections and derives lightweight focus logs.
   - Future code could parse stored JSON memories and aggregate strengths/weaknesses locally.

4. Add `improve()` only after there is enough stored memory.
   - Do not add this until requirements are clear.

5. Add `forget()` or deletion controls for privacy/GDPR-style workflows.
   - Requires careful UX and data policy decisions.

6. Add memory quality controls.
   - Avoid duplicate memories.
   - Summarize repeated weaknesses over time.
   - Avoid over-personalization.

### Guardrails for future agents

Before making changes:

- Read latest Cognee docs: https://docs.cognee.ai/
- Keep Cognee failures non-blocking unless explicitly asked otherwise.
- Do not change Gemini/Deepgram/database schema unless the task explicitly requires it.
- Do not inject raw transcripts, audio, resume PDFs, or full report text into Cognee memory.
- Keep resume and job description as primary prompt context.
- Use memory only as additional personalization context.
- Preserve existing interview templates and question counts when personalizing.

## Current manual end-to-end test plan

1. Ensure `.env.local` has Cognee variables.
2. Run:

```bash
npm run dev
```

3. Start and complete Interview 1.
4. Confirm report generation succeeds.
5. Confirm logs show:

```txt
[Cognee] Memory stored successfully
```

6. Start Interview 2 for the same user.
7. Confirm logs show:

```txt
[Cognee] Recall started...
[Cognee] Retrieved N relevant memories
[Cognee] Personalization Summary
[Cognee] Weakness Focus: ...
[Cognee] Strength Focus: ...
[Cognee] Passing memory to Prompt Builder
[Cognee] Gemini Generation Started
[Prompt Builder] Final Prompt
```

8. Confirm final prompt contains:

```txt
Candidate Memory
```

9. Confirm interview question generation still succeeds if Cognee is unavailable by temporarily using an invalid Cognee key, then restoring it.
