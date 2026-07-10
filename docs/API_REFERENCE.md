# API Reference

Complete reference for all HTTP API routes under `app/api/`. All routes are Next.js Route Handlers.

## Conventions

### Authentication

Most routes require a signed-in Clerk user. The session cookie is sent automatically by the browser (`fetch` with `credentials: "include"` from same origin). Unauthenticated requests return `401`.

The Clerk webhook (`/api/webhook/clerk`) is verified by Svix signature, not by a session.

### Response envelopes

Two envelope shapes exist in the codebase (historical). Check the per-route examples for which one applies.

**Legacy (`ok` / `fail`):**

```json
// success
{ "ok": true, "data": { /* ... */ } }
// error
{ "ok": false, "error": "message" }
```

**Phase 2 (`success` / `failure`):**

```json
// success
{ "success": true, "data": { /* ... */ } }
// error
{ "success": false, "message": "message" }
// validation error (422)
{ "success": false, "message": "Validation failed", "errors": ["field: msg"] }
```

> Note: a few older routes return ad-hoc shapes (e.g. `/api/health`, `/api/user/usage`). Documented per route below.

### Common status codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 400 | Bad request / invalid body |
| 401 | Unauthorized (no Clerk session) |
| 403 | Forbidden (owns-resource check failed) |
| 404 | User/resource not found |
| 422 | Validation failed (Zod) |
| 429 | Interview limit reached |
| 501 | Feature not configured / not implemented |
| 502 / 503 | Upstream (Deepgram / Cognee / DB) unavailable |

---

## Health

### GET `/api/health`

DB liveness ping. No auth.

```bash
curl https://APP/api/health
```

```json
{ "status": "ok", "database": "connected", "timestamp": "2026-07-10T12:00:00.000Z" }
```

`503` with `"status": "error"`, `"database": "disconnected"` if DB unreachable.

### GET `/api/cognee/health`

Round-trips a test memory through Cognee (`remember` → `recall`). No auth.

```bash
curl https://APP/api/cognee/health
```

```json
{ "success": true }
```

`502` if recall did not return the test memory; `503` if Cognee unavailable.

---

## Auth & User

### GET `/api/auth/me`

Returns current user, upserting from Clerk on first visit (creates `profile` + `analytics`).

```bash
curl https://APP/api/auth/me
```

```json
{
  "success": true,
  "data": {
    "user": { "id": "usr_...", "clerkId": "user_...", "email": "a@b.com", "fullName": "Jane Doe", "createdAt": "...", "updatedAt": "..." },
    "profile": { /* UserProfile */ },
    "analytics": { /* InterviewAnalytics */ }
  }
}
```

### POST `/api/user/onboarding`

Creates/updates the profile after signup. Syncs Clerk user to DB first.

**Body:**

```json
{
  "experience": "Mid",
  "targetRole": "Backend Engineer",
  "githubUrl": "https://github.com/jane",
  "linkedinUrl": "https://linkedin.com/in/jane",
  "preferredInterviewMode": "VOICE",
  "preferredDifficulty": "MEDIUM",
  "targetCompanies": ["Google", "Stripe"],
  "interviewTypes": ["SYSTEM_DESIGN", "BEHAVIORAL"]
}
```

`experience` and `targetRole` required. `preferredInterviewMode` ∈ `VOICE|TEXT|HYBRID` (default `VOICE`). `preferredDifficulty` ∈ `EASY|MEDIUM|HARD` (default `MEDIUM`). URLs may be empty string.

```bash
curl -X POST https://APP/api/user/onboarding \
  -H "Content-Type: application/json" \
  -d '{"experience":"Mid","targetRole":"Backend Engineer","preferredInterviewMode":"VOICE","preferredDifficulty":"MEDIUM"}'
```

```json
{ "success": true, "data": { "profile": { /* ... */ } } }
```

### GET `/api/user/profile`

Full profile incl. latest resume + job description.

```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "clerkId": "...", "email": "...", "fullName": "...", "createdAt": "...", "updatedAt": "..." },
    "profile": { /* ... */ },
    "latestResume": { /* Resume | null */ },
    "latestJobDescription": { /* JobDescription | null */ },
    "analytics": { /* ... */ }
  }
}
```

### PATCH `/api/user/profile`

Partial profile update. All fields optional; at least one required.

**Body** (same field set as onboarding, all optional):

```json
{ "targetRole": "Staff Engineer", "preferredDifficulty": "HARD" }
```

```bash
curl -X PATCH https://APP/api/user/profile \
  -H "Content-Type: application/json" \
  -d '{"preferredDifficulty":"HARD"}'
```

```json
{ "success": true, "data": { "profile": { /* ... */ } } }
```

`400` if body empty. `422` on validation failure.

### GET `/api/user/usage`

Interview quota. `dynamic = force-dynamic`.

```json
{
  "success": true,
  "data": { "totalUsed": 1, "maxUses": 3, "remaining": 2, "isLimitReached": false }
}
```

### DELETE `/api/user/data`

Deletes all interviews, resumes, job descriptions, analytics for the user (transaction). Does not delete the Clerk account or Cognee memory.

```bash
curl -X DELETE https://APP/api/user/data
```

```json
{ "success": true, "message": "User data deleted successfully" }
```

---

## Resume & Job Description

### POST `/api/user/resume`

Uploads and parses a resume file. `multipart/form-data`, field `file`. Runtime: `nodejs`.

```bash
curl -X POST https://APP/api/user/resume -F "file=@resume.pdf"
```

```json
{
  "success": true,
  "resumeId": "res_...",
  "fileUrl": "https://.../resume.pdf",
  "originalFileName": "resume.pdf",
  "storedFileName": "res_....pdf",
  "fileSize": 84213,
  "mimeType": "application/pdf",
  "charactersExtracted": 4120,
  "pages": 2,
  "message": "Resume uploaded and text extracted successfully."
}
```

Errors: `400` no file / validation, `422` parse failure, `500` storage/DB error.

### POST `/api/user/job-description`

Saves a job description record.

**Body:**

```json
{ "company": "Stripe", "title": "Backend Engineer", "fileUrl": "https://.../jd.pdf" }
```

`company` and `title` required; `fileUrl` optional (must be valid URL).

```json
{ "success": true, "data": { "jobDescription": { /* ... */ } } }
```

---

## Interview Lifecycle

Typical flow: `start` → `generate` → (`answer` per question) → `end`. Voice flow uses `voice/token` + `voice/answer`.

### POST `/api/interview/start`

Creates a session (may reuse an existing one unless `forceNew`).

**Body** (all optional except conditional rules):

```json
{
  "company": "Google",
  "role": "Backend Engineer",
  "interviewType": "SYSTEM_DESIGN",
  "difficulty": "MEDIUM",
  "jobDescription": "…",
  "forceNew": false
}
```

Conditional: if `company === "Other"`, both `companyType` and `customCompanyName` are required. `difficulty` uses the Prisma `Difficulty` enum.

```bash
curl -X POST https://APP/api/interview/start \
  -H "Content-Type: application/json" \
  -d '{"company":"Google","role":"Backend Engineer","interviewType":"SYSTEM_DESIGN","difficulty":"MEDIUM"}'
```

```json
{ "success": true, "data": { "interviewId": "int_...", "status": "READY" } }
```

Errors: `404` profile/resume not found, `400` config incomplete, `422` validation, **`429`** limit reached:

```json
{ "success": false, "code": "INTERVIEW_LIMIT_REACHED", "message": "You have reached the monthly interview limit.", "remaining": 0 }
```

### POST `/api/interview/generate`

Generates questions for a session.

**Body:** `{ "interviewId": "int_..." }`

```json
{
  "success": true,
  "data": {
    "interviewId": "int_...",
    "status": "READY",
    "totalQuestions": 5,
    "questions": [ /* ... */ ],
    "currentQuestion": { /* ... */ }
  }
}
```

Errors: `400` invalid body, `404` interview/user not found, `403` unauthorized (not owner).

### POST `/api/interview/answer`

Saves an answer transcript (text/V1 flow).

**Body:**

```json
{ "interviewId": "int_...", "sequence": 1, "transcript": "My answer…", "duration": 42 }
```

`sequence` = positive int. `transcript` accepted as `transcript` or `text`; must be non-empty. `duration` accepted as `duration` or `durationSec` (default 0).

```json
{ "success": true, "data": { /* advance result */ } }
```

`404` `INTERVIEW_NOT_FOUND`, `400` empty transcript.

### POST `/api/interview/voice/answer`

Voice Agent turn handler — saves transcript, returns next question (or done).

**Body:**

```json
{ "interviewId": "int_...", "sequence": 1, "transcript": "…", "durationSec": 30 }
```

`transcript` required non-empty (differs from V1 route).

```json
{ "success": true, "data": { /* next question or done */ } }
```

### GET `/api/interview/voice/token`

Mints a short-lived Deepgram token (TTL 300s) for the browser to open the Voice Agent WebSocket (`wss://agent.deepgram.com/v1/agent/converse`).

```json
{ "success": true, "data": { /* deepgram token */ } }
```

`501` if Deepgram not configured, `401` if not signed in.

### POST `/api/interview/end`

Evaluates the interview, saves the report, marks `COMPLETED`, stores semantic memory in Cognee.

**Body:** `{ "interviewId": "int_..." }`

```json
{ "success": true, "data": { /* Report */ } }
```

`404` `INTERVIEW_NOT_FOUND`.

### POST `/api/interview/cancel`

Marks a cancellable interview (`READY|GENERATING|ONGOING|FAILED`) as `CANCELLED`. Idempotent — always returns success even if already gone.

**Body:** `{ "interviewId": "int_..." }`

```json
{ "success": true }
```

### GET `/api/interview/history`

All reports for the user (legacy envelope).

```json
{ "ok": true, "data": [ /* Report[] */ ] }
```

### GET `/api/interview/next` — `501`

Not implemented (server-managed progression). Returns `notImplemented`.

### GET `/api/interview/[id]` — `501`

Not implemented (interview lookup). Returns `notImplemented`.

---

## Reports & Analytics

### POST `/api/reports/generate`

Same pipeline as `interview/end` but returns the raw evaluation (legacy envelope). Optional `provider` selects the AI provider.

**Body:**

```json
{ "interviewId": "int_...", "provider": "gemini" }
```

```json
{ "ok": true, "data": { /* evaluation */ } }
```

### GET `/api/reports/[id]`

Fetch one report by id (legacy envelope).

```bash
curl https://APP/api/reports/rep_123
```

```json
{ "ok": true, "data": { /* Report */ } }
```

`404` `{ "ok": false, "error": "report not found" }`.

### GET `/api/analytics`

Summary computed over all the user's reports (legacy envelope).

```json
{ "ok": true, "data": { /* analytics summary */ } }
```

---

## Memory

### GET `/api/memory/graph`

Aggregates strengths / weaknesses / recommendations from the user's last 10 reports into memory nodes (legacy envelope).

```json
{
  "ok": true,
  "data": {
    "nodes": [ { "id": "mem-0", "userId": "user_...", "content": "### Strengths", "kind": "fact", "createdAt": "..." } ],
    "edges": []
  }
}
```

### GET `/api/memory/insights` — `501`

Placeholder. Requires a production Cognee dataset.

```json
{ "ok": false, "error": "Memory insight queries are not available in this environment" }
```

### GET / POST `/api/memory/timeline` — `501`

Placeholder — legacy in-process stub removed in favor of Cognee. Memory flows through `interview/end` (store) and `interview/start` (recall).

```json
{ "ok": false, "error": "Memory timeline is not available in this environment" }
```

### DELETE `/api/cognee/forget`

Permanently deletes all Cognee memory for a user. Account-deletion use only. Caller must own the `userId`.

**Body:** `{ "userId": "<internal app userId>" }`

```bash
curl -X DELETE https://APP/api/cognee/forget \
  -H "Content-Type: application/json" \
  -d '{"userId":"usr_123"}'
```

```json
{ "ok": true, "data": { "datasetDeleted": true, "message": "…" } }
```

Errors: `400` userId required, `401` unauthorized, `403` forbidden (userId not owned), `404` user not found.

---

## Speech

### GET `/api/speech/token`

Short-lived Deepgram token (default TTL) for browser STT/TTS WebSocket.

```json
{ "success": true, "data": { /* token */ } }
```

`501` if Deepgram not configured, `401` if not signed in.

### POST `/api/speech/speak`

Text-to-speech. Streams `audio/mpeg` from Deepgram (not JSON on success).

**Body:** `{ "text": "Hello there" }`

```bash
curl -X POST https://APP/api/speech/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello there"}' --output out.mp3
```

Success: `200`, `Content-Type: audio/mpeg`, body = audio stream.
Errors: `501` `DEEPGRAM_API_KEY` missing, `400` invalid JSON / validation, `502` synthesis failed.

### POST `/api/speech/transcribe`

Speech-to-text. `multipart/form-data`, field `audio` (a File). Uses Deepgram if configured, else OpenAI Whisper, else a stub (legacy envelope).

```bash
curl -X POST https://APP/api/speech/transcribe -F "audio=@clip.webm"
```

```json
{ "ok": true, "data": { "text": "transcribed text", "isFinal": true } }
```

`400` if `audio` missing.

---

## Webhook

### POST `/api/webhook/clerk`

Clerk → DB sync. Verified by Svix signature (`verifyWebhook`). Runtime: `nodejs`. Not called directly by clients.

Handles `user.created`, `user.updated` (upsert), `user.deleted` (delete).

```json
{ "ok": true, "data": { "received": true } }
```

`400` on signature/verification failure.
