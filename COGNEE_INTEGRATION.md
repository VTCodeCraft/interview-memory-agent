# Cognee Integration Handoff

This document summarizes the Cognee integration implemented so far in the AI Interview Platform. It is intended for future agents/engineers so they can understand the current architecture and continue safely.

## High-level status

Completed phases:

- Phase 1: Cognee Cloud connection
- Phase 2: Memory Builder
- Phase 3: Persist semantic interview memory into Cognee
- Phase 4: Retrieve candidate memory before Gemini question generation
- Phase 5: Adaptive interview personalization using Cognee memory

Not implemented yet:

- `improve()`
- `forget()`
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
  recallCandidateMemory()

services/memory-builder.service.ts
  buildMemory(report)
  semantic report-to-memory conversion

services/memory.service.ts
  persistInterviewMemory(report)
  non-blocking post-report persistence into Cognee

services/promptBuilder.service.ts
  prepareInterviewPrompt(interview)
  recalls memory before building Gemini prompt

lib/ai/promptBuilder.ts
  buildInterviewGenerationPrompt(...)
  appends adaptive Candidate Memory section

app/api/cognee/health/route.ts
  Phase 1 health + remember/recall smoke test

app/api/interview/end/route.ts
  saves report, then persists memory to Cognee

app/api/reports/generate/route.ts
  saves report, then persists memory to Cognee
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
