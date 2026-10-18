# Frontend-discovered issues (deferred backlog)

Logic, backend, schema, API, security, data-correctness and product issues found
during the frontend redesign. They are recorded here and **not fixed** during
frontend work, unless one blocks a page or makes continuing unsafe. They will be
handled in the backend, logic and production-readiness phase.

**Priority**

- **P1**: fix or verify before production.
- **P2**: should fix; real user impact, workaround exists.
- **P3**: clean-up or product decision.

**Status**: `open` (not investigated), `verify` (needs a live test to confirm),
`decision` (needs a product or legal call).

**Adding an entry**: next free ID; page where it was found; location; impact;
evidence (what was observed or read, and whether it was tested or only read);
proposed investigation. Never include secrets, tokens or environment values.

## Summary

| ID | Title | Found during | Priority | Status |
|---|---|---|---|---|
| FDI-001 | Resume uploads near 10 MB may fail in deployment | Onboarding | P1 | verify |
| FDI-002 | Signed-in onboarding not verified live | Onboarding | P1 | verify |
| FDI-003 | Privacy page assurances not verified | Landing | P1 | decision |
| FDI-004 | Onboarding API returns raw error text on 500 | Onboarding | P2 | open |
| FDI-005 | Experience is required but never used | Onboarding | P2 | decision |
| FDI-006 | Saving onboarding overwrites every profile field | Onboarding | P2 | open |
| FDI-007 | Expired session during an API call returns a redirect, not 401 | Onboarding | P3 | verify |
| FDI-008 | Resume type check relies on the browser-reported MIME type | Onboarding | P3 | open |
| FDI-009 | Resume `fileUrl` points to a file that is never written | Onboarding | P3 | open |
| FDI-010 | Job description text cannot be saved outside an interview | Onboarding | P3 | decision |
| FDI-011 | Profile accepts TEXT / HYBRID interview modes | Onboarding | P3 | decision |
| FDI-012 | Placeholder and unverified external links | Landing | P3 | open |
| FDI-013 | Clerk application still named "Congee" | Landing | P3 | open |
| FDI-014 | Profile API sends the full resume record, including extracted text, to the browser | Dashboard | P2 | open |
| FDI-015 | No way to list all interviews with their status | Dashboard | P2 | decision |
| FDI-016 | Failed report generation is not surfaced outside the report URL | Dashboard | P3 | open |
| FDI-017 | Interview type stored in two formats | Dashboard | P3 | open |
| FDI-018 | Interview analytics row is never updated | Interview setup | P3 | decision |
| FDI-019 | Memory insights endpoint is a 501 placeholder | Interview setup | P3 | open |
| FDI-020 | Cancelling while questions are generated still uses up an interview | Interview setup | P3 | decision |
| FDI-021 | Role edits in setup live only in browser storage | Interview setup | P3 | decision |
| FDI-022 | Voice check tests a different token route and endpoint than the live interview | Voice check | P2 | decision |
| FDI-023 | useDeepgram can leave the microphone open | Voice check | P2 | open |
| FDI-024 | Voice check confirms permission, not that audio is captured | Voice check | P3 | decision |
| FDI-025 | Natural completion can send `POST /api/interview/end` more than once | Live interview | P3 | verify |
| FDI-026 | Interview duration is not available to the live room | Live interview | P3 | decision |
| FDI-027 | Evaluation scores are saved without validation | Reports list | P2 | open |
| FDI-028 | Per-question feedback is generated but never stored | Reports list | P2 | open |
| FDI-029 | Report history is unpaginated and returns full report bodies | Reports list | P3 | open |
| FDI-030 | Historical progress is generated but not stored | Report detail | P3 | decision |
| FDI-031 | Every category is scored for every interview type | Report detail | P3 | decision |

---

## Deferred frontend items

Visual or navigation items outside the current page's scope, kept for the phase
that owns them. These are not logic issues.

| ID | Item | Location | Deferred to |
|---|---|---|---|
| FE-001 | ~~Account menu icons use Material Symbols; Precision uses Lucide (stroke 1.75)~~ Resolved in the shared navigation work (2026-10-11): Lucide icons | `components/common/AccountMenu.tsx` (`MenuIcon`) | Done |
| FE-002 | ~~Account menu "My Dashboard" during onboarding goes to `/interviews`, which sends incomplete users straight back to onboarding~~ Resolved (2026-10-11): `AccountMenu` takes `dashboardHref`; onboarding and the landing nav link to `/onboarding` (keeping a safe `next`) via `lib/routing/dashboard-link.ts`. Remaining: the legacy `components/Header.tsx` on `/privacy` and `/terms` can't know onboarding status, so it still links `/interviews`, which the guard redirects to `/onboarding?next=%2Finterviews` (no loop). | `components/common/AccountMenu.tsx`, `app/onboarding/layout.tsx`, `components/landing-page/Navbar.tsx` | Done (legal pages: their redesign) |
| FE-003 | `Footer` `variant="minimal"` is no longer used (onboarding has its own footer) | `components/Footer.tsx` | Clean-up with the legal pages or the shared layout |
| FE-004 | App pages not yet redesigned keep the legacy look (`bg-background` #FAF6FD, Material Symbols, legacy type scale) under the new Precision navigation, so there is a visible seam between the nav and their content. Only their sidebar wrappers were changed. | `app/(app)/memory`, `analytics`, `profile` (`interviews/new`, `/reports` and `/reports/[id]` are done) | Each page's own redesign |
| FE-005 | Two legacy layout details were offset for the sticky nav and should be rebuilt with their pages: the fixed right panel on `/memory` (now starts below the nav at `xl`) and the sticky left column on `/profile` (now clears the nav) | `app/(app)/memory/page.tsx`, `app/(app)/profile/page.tsx` | Memory and Profile redesigns |
| FE-006 | `components/interview/QuestionCard.tsx` (`InterviewStepCard`) is not imported anywhere and still uses legacy styles (zinc, uppercase labels); the live room shows the current question itself | `components/interview/QuestionCard.tsx` | Clean-up pass (delete) |
| FE-007 | Report presentation is repeated on the dashboard, `/reports` and `/reports/[id]`: the date with mono digits, the score with `/100` and the score bar, and the label helpers (imported from the dashboard's `dashboard-data.ts`). `components/reports/ReportCard.tsx` and `ReportDetailCard.tsx` were deleted with the report page redesign (both unused by then). | `app/(app)/interviews/_components`, `app/(app)/reports/_components`, `app/(app)/reports/[id]/_components` | A shared clean-up pass (move the pieces to `components/reports`) |
| FE-008 | `/reports` does not refresh by itself when a processing report finishes; the row links to the report page, which has its own refresh button. Polling the existing pending-report endpoint is possible but was left out to keep requests to page loads. | `app/(app)/reports/page.tsx` | Product decision |
| FE-009 | `/reports/[id]` now has a `loading.tsx`, so the page streams. When the id is unknown or not the user's, `notFound()` still shows the not-found UI (with `noindex`), but a direct page load now returns HTTP 200 instead of 404, as Next.js does for streamed responses. The route is signed-in only, so this affects no crawler; deleting `loading.tsx` restores the 404 at the cost of no loading state. | `app/(app)/reports/[id]/loading.tsx` | Keep unless a 404 status is needed |

---

## FDI-001: Resume uploads near 10 MB may fail in deployment

- **Found during**: Onboarding redesign (2026-10-11)
- **Location**: `lib/utils/constants.ts` (`MAX_FILE_SIZE` = 10 MB), `app/api/user/resume/route.ts`, `proxy.ts` (matcher includes `/api/*`), `next.config.ts` (no `experimental.proxyClientMaxBodySize`)
- **Impact**: The UI accepts PDFs up to 10 MB, but uploads close to or above that size may fail with a generic error.
- **Evidence** (read, not tested):
  - Bundled Next.js docs (`node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/proxyClientMaxBodySize.md`) say request bodies passing through proxy are buffered only up to 10 MB by default. A 10 MB file plus multipart overhead exceeds that.
  - The production site is on Vercel (`metadataBase` in `app/layout.tsx`). Vercel Functions have a request-body limit well below 10 MB; check the current figure for the plan in use.
- **Investigate**:
  - Upload PDFs of about 4, 6 and 9.9 MB on the deployed site.
  - Then either upload directly to storage (signed URL), or lower `MAX_FILE_SIZE` and the UI copy to a size the platform accepts.
  - Onboarding already shows a "file too large" message for HTTP 413.

## FDI-002: Signed-in onboarding not verified live

- **Found during**: Onboarding redesign
- **Location**: `app/onboarding/page.tsx`, `app/onboarding/OnboardingForm.tsx`, `app/api/user/resume/route.ts`
- **Impact**: Unknown until tested. These paths were checked only by code inspection.
- **Evidence**:
  - Clerk sign-in can't be automated in this workflow.
  - UI states were browser-tested with a temporary harness and simulated responses.
  - The signed-out redirect was HTTP-tested.
- **Investigate**, with a test account:
  - First-time flow end to end, with a real PDF parse.
  - Prefill after a partial setup.
  - Returning user with a resume on file (no re-upload).
  - Redirect when onboarding is already complete, with and without `?next=`.
  - Upload blocked while an interview is active (400 message).
  - GitHub / LinkedIn values unchanged after finishing onboarding.

## FDI-003: Privacy page assurances not verified

- **Found during**: Landing finalization
- **Location**: `app/privacy/page.tsx`
- **Impact**: Legal and trust risk if any statement is untrue.
- **Evidence**: Read only. No implementation evidence was found in the repository for:
  - AES-256 / TLS 1.3
  - SOC 2
  - DPAs / SCCs
  - 30-day deletion
  - "improve our AI models"
  - `privacy@clutchly.com`
- **Investigate**: Legal review. Keep only statements backed by configuration or contracts.

## FDI-004: Onboarding API returns raw error text on 500

- **Found during**: Onboarding redesign
- **Location**: `app/api/user/onboarding/route.ts:32` (`failure(message, 500)` with `reason.message`)
- **Impact**: Internal error text (for example Prisma messages) can reach the client. Other routes use `errorResponse()` in `lib/utils/api.ts`, which logs the real error and returns a friendly one.
- **Evidence**: Read. The redesigned form never displays 500 text; it shows a generic message (browser-tested with a simulated 500).
- **Investigate**: Switch to `errorResponse(reason, "...")`. Look for other routes with the same pattern.
- **Also found** (dashboard, 2026-10-11): `app/api/user/profile/route.ts` returns `reason.message` the same way in GET and PATCH (`failure(message, 500)`). The dashboard shows a generic message instead.
- **Also found** (interview setup, 2026-10-11): `app/api/user/usage/route.ts:37` returns `error.message` on 500. The setup page only hides the usage panel when it fails.
- **Also found** (voice check, 2026-10-11): `app/api/speech/token/route.ts` returns `reason.message` on 500, and `hooks/useDeepgram.ts` appends it to its "Token request failed: …" error. The redesigned check shows only plain guidance, never that text.

## FDI-005: Experience is required but never used

- **Found during**: Onboarding redesign
- **Location**: `lib/auth/app-user.ts` (`isOnboardingComplete` requires `profile.experience`), `services/promptBuilder.service.ts` and question generation (no reference)
- **Impact**: Users must provide a value that doesn't personalize anything. The onboarding copy says only that it's saved to the profile.
- **Evidence**: Repository-wide search found `experience` read only by the completion check and written by `upsertProfile`.
- **Investigate**: Product decision. Either use experience in prompts, or drop it from the completion rule. The second option also changes the onboarding UI.

## FDI-006: Saving onboarding overwrites every profile field

- **Found during**: Onboarding redesign
- **Location**: `services/user.service.ts` `upsertProfile` (`githubUrl: input.githubUrl || null`, and the same for all fields)
- **Impact**: Any client that omits a field (for example GitHub or LinkedIn, which onboarding no longer shows) clears it.
- **Evidence**: Read. The redesigned onboarding sends the saved GitHub and LinkedIn values back unchanged as a workaround (browser-tested: payload contains them).
- **Investigate**: Update only the fields provided, or split the onboarding and profile schemas.

## FDI-007: Expired session during an API call returns a redirect, not 401

- **Found during**: Onboarding redesign
- **Location**: `proxy.ts:48` (`auth.protect()` for protected API routes)
- **Impact**: A request made after the session expires may get a redirect to the Clerk sign-in page. Browsers then report a network failure, so users see "couldn't reach the server" instead of "sign in again".
- **Evidence**:
  - Signed-out `curl -X POST` to `/api/user/resume` and `/api/user/onboarding` returned 307.
  - In the onboarding review (2026-10-11), a signed-out client navigation to `/interviews` was redirected to the Clerk sign-in page, and the browser blocked it as cross-origin (console). This was a page navigation, not an API call.
  - Browser `fetch`/XHR behaviour for the API routes was not verified.
- **Investigate**: Confirm in the browser. If confirmed, have API routes return 401 JSON, for example with `auth.protect()` options or an API-specific check.

## FDI-008: Resume type check relies on the browser-reported MIME type

- **Found during**: Onboarding redesign
- **Location**: `services/resume.service.ts:165` (`file.type !== "application/pdf"`, plus a `.pdf` extension check)
- **Impact**: Some browsers or operating systems report an empty or different MIME type for valid PDFs, so these would be rejected. The client mirrors the same rule.
- **Evidence**: Read only.
- **Investigate**: Check the `%PDF-` magic bytes on the server; accept an empty type when the extension and magic bytes match.

## FDI-009: Resume `fileUrl` points to a file that is never written

- **Found during**: Onboarding redesign
- **Location**: `services/storage.service.ts:40` (`LocalResumeStorage.save` builds `/uploads/<name>` but writes nothing)
- **Impact**: The `Resume.fileUrl` saved in the database is a dead link. No current UI links to it (search found no `fileUrl` use in `app/` or `components/`), but a future "view resume" feature would 404.
- **Evidence**: Read.
- **Investigate**: Decide whether the PDF should be stored. If not, stop exposing `fileUrl`. Onboarding copy currently states the PDF itself isn't kept.

## FDI-010: Job description text cannot be saved outside an interview

- **Found during**: Onboarding redesign
- **Location**: `app/api/user/job-description/route.ts` (accepts `company`, `title` and `fileUrl` only); `/api/interview/start` (`jobDescription` per interview); `docs/FRONTEND_WORKFLOW.md:24,135` (lists "Job Description Upload" in the first-time flow)
- **Impact**: The docs describe a flow the backend doesn't support. Onboarding tells users to paste a job description during interview setup instead.
- **Evidence**: Read.
- **Investigate**: Product decision. Either store a reusable job description, or update `docs/FRONTEND_WORKFLOW.md`.

## FDI-011: Profile accepts TEXT / HYBRID interview modes

- **Found during**: Onboarding redesign
- **Location**: `lib/validations/onboarding.ts:9`, Prisma `InterviewMode`
- **Impact**: The schema allows modes the product doesn't offer (voice only). Onboarding always sends `VOICE`.
- **Evidence**: Read.
- **Investigate**: Restrict validation to `VOICE`, or document the modes as reserved.

## FDI-012: Placeholder and unverified external links

- **Found during**: Landing finalization
- **Location**: `lib/utils/constants.ts`:
  - `FEEDBACK_FORM_URL` and `BUG_REPORT_FORM_URL` contain `REPLACE_WITH_…` (lines 18 and 20)
  - `SOCIAL_LINKS` (line 7) points to unverified accounts
  - `CONTACT_FORM_URL`: the Typeform is titled "New form"
- **Impact**: Broken or wrong links if they're surfaced again. The landing footer no longer shows the placeholders.
- **Evidence**: Read. Placeholder links were removed from the footer during landing work.
- **Investigate**: Replace with real URLs or delete the constants.

## FDI-013: Clerk application still named "Congee"

- **Found during**: Landing redesign
- **Location**: Clerk Dashboard (external configuration, not in the repository)
- **Impact**: The sign-in and sign-up modals show the wrong product name.
- **Evidence**: Flagged during landing work (2026-10-10). Can't be checked or changed from the repository.
- **Investigate**: The owner renames the application in the Clerk Dashboard.

## FDI-014: Profile API sends the full resume record, including extracted text, to the browser

- **Found during**: Dashboard redesign (2026-10-11)
- **Location**: `app/api/user/profile/route.ts` (`latestResume: profile.resumes[0]`), `services/user.service.ts` `getFullProfile` (`resumes` included without a `select`)
- **Impact**: Every call to `GET /api/user/profile` returns the latest resume's full extracted `rawText` and storage metadata, although the dashboard and other pages only need the file name and date. Larger responses on each page load, and personal data sent to the browser that isn't needed there.
- **Evidence**: Read only. The redesigned dashboard reads only `originalFileName` and `uploadedAt`.
- **Investigate**: Select only the fields the UI needs (for example `originalFileName`, `pageCount`, `uploadedAt`). Check whether any page actually needs `rawText` before removing it.

## FDI-015: No way to list all interviews with their status

- **Found during**: Dashboard redesign
- **Location**: `app/api/interview/history/route.ts` (returns `listReports`, interviews with a report only), `services/report.service.ts` `getPendingReportInterview` (`findFirst`, latest only)
- **Impact**: The dashboard can show finished interviews with reports, the single active interview and the latest report still being generated. Interviews that were cancelled, failed, or ended without a report job never appear. If two reports are generating at once, only the newest is visible.
- **Evidence**: Read. The dashboard was built on the existing endpoints and shows exactly these states (browser-tested with simulated responses).
- **Investigate**: Product decision on whether users should see every interview. If yes, add a read-only list of the user's interviews with status and report state (reusing `getInterviewReportView` states), then show it on the dashboard and reports pages.
- **Also affects `/reports` (2026-10-12)**: the redesigned list shows finished reports plus at most one processing row, for the same reason. Cancelled, failed and unreported interviews do not appear there either.

## FDI-016: Failed report generation is not surfaced outside the report URL

- **Found during**: Dashboard redesign
- **Location**: `services/report.service.ts` `getPendingReportInterview` (doc comment says it covers failed evaluations, but the query only matches jobs with status `PENDING` or `PROCESSING`); `getInterviewReportView` does return a `failed` state
- **Impact**: When report generation fails, nothing on the dashboard or reports list points the user to it. They only see the failure if they open that interview's report URL.
- **Evidence**: Read only.
- **Investigate**: Decide whether failed jobs should appear (with a retry where supported). Align the doc comment with the query either way.
- **Also affects `/reports/[id]` (2026-10-19)**: the failed state can only say that generation failed after several attempts. The job's `failureReason` and `lastError` are not exposed, and nothing re-queues a `FAILED` job (`POST /api/interview/end` leaves an existing job as it is), so the page offers no retry.
- **Also affects `/reports` (2026-10-12)**: the list has no failed state to show, so a failed report is simply absent from it.

## FDI-017: Interview type stored in two formats

- **Found during**: Dashboard redesign
- **Location**: `Interview.interviewType` stores the setup label (`"Technical"`, `"Behavioral"`, `"System Design"`, from `app/(app)/interviews/new/page.tsx`); `UserProfile.interviewTypes` stores keys (`"technical"`, `"behavioral"`, `"system_design"`)
- **Impact**: Every screen that shows or compares interview types must map both formats; renaming a label in setup would silently change stored data.
- **Evidence**: Read. The dashboard maps both formats in `app/(app)/interviews/_components/dashboard-data.ts` (`typeLabel`).
- **Investigate**: Store one canonical key on interviews and map to labels in the UI; migrate existing rows if needed.

## FDI-018: Interview analytics row is never updated

- **Found during**: Interview setup redesign (2026-10-11)
- **Location**: Prisma `InterviewAnalytics` (`totalInterviews`, `averageScore`, `currentStreak`, `readinessScore`); created empty in `services/auth.service.ts` and `app/api/auth/me/route.ts`; no code updates it (only `prisma/seed.ts` writes values)
- **Impact**: `GET /api/user/profile` returns `analytics` with zeros forever. The old setup page used `totalInterviews` to choose between a "Welcome" card and a "Dynamic Insights" card with a "Readiness Score", so real users always saw the welcome card and the insights card could never show real data. The redesign no longer reads this row; nothing else in the UI should until it is populated.
- **Evidence**: Read (repository-wide search for writers of `interviewAnalytics`).
- **Investigate**: Decide whether to maintain these aggregates (for example when a report is saved) or remove the model. `/api/analytics` already computes totals from reports.

## FDI-019: Memory insights endpoint is a 501 placeholder

- **Found during**: Interview setup redesign
- **Location**: `app/api/memory/insights/route.ts` (always 501 "not available in this environment"); `lib/rate-limit/config.ts:158` still has a rule for it
- **Impact**: The old setup page and old dashboard called it; both redesigns removed those calls, so nothing in the UI uses it now. Remaining risk is confusion for future pages.
- **Evidence**: Read; repository search shows no UI callers after the redesigns.
- **Investigate**: Implement it with the Cognee dataset or remove the route and its rate-limit rule.

## FDI-020: Cancelling while questions are generated still uses up an interview

- **Found during**: Interview setup redesign
- **Location**: `services/usage.service.ts` (`COUNTED_STATUSES` includes `CANCELLED`); `services/interview.service.ts` limit check counts the same statuses
- **Impact**: A user who cancels during question generation (before the interview starts) loses one of their interviews for the window. The setup page states this before they confirm, as the old page did.
- **Evidence**: Read; the cancel dialog copy was kept consistent with this rule.
- **Investigate**: Product decision on whether interviews cancelled before going live should count.

## FDI-021: Role edits in setup live only in browser storage

- **Found during**: Interview setup redesign
- **Location**: `store/useSettingsStore.ts` (`targetRole`, persisted to `localStorage` key `ima-settings`); `hooks/useInterview.ts` sends `role: targetRole` to `POST /api/interview/start`; the setup page overwrites it from the profile on each load
- **Impact**: The role sent for an interview comes from client-side state rather than the profile or the request form fields. Edits on the setup page apply to that interview and are not saved to the profile (the page says so). The API schema marks `role` optional, but the service rejects a missing role with `INTERVIEW_CONFIG_INCOMPLETE` (400), so an empty role produces a different error than other validation failures (422). The redesign now blocks an empty role on the client.
- **Evidence**: Read; browser-tested that the request body carries the edited role.
- **Investigate**: Send the role explicitly from the setup form, and make `role` required in `StartInterviewSchema` so validation errors are consistent.

## FDI-022: Voice check tests a different token route and endpoint than the live interview

- **Found during**: Voice check redesign (2026-10-11)
- **Location**: `hooks/useDeepgram.ts` (used by `/interviews/check`) gets a token from `GET /api/speech/token` and opens `wss://api.deepgram.com/v1/listen`; `hooks/useVoiceAgent.ts` (live interview) gets a token from `GET /api/interview/voice/token` and opens `wss://agent.deepgram.com/v1/agent/converse` (`lib/deepgram/voice-agent/connection.ts`)
- **Impact**: The check proves microphone access and that Deepgram can be reached with a browser token, but not the exact connection the interview uses. The check can pass while the interview connection fails (for example agent-specific errors or a different rate limit), or fail for listen-only reasons.
- **Evidence**: Read. The redesigned check only claims what it actually tests ("reach the voice service").
- **Investigate**: Decide whether the check should exercise the voice-agent token route and endpoint (without starting the interview), or keep it as a general connectivity check.
- **Compatibility audit (live interview redesign, 2026-10-12)**: Read only; no backend changes.
  - Shared: both routes require a signed-in user, return 501 when Deepgram isn't configured, and mint the token with the same `createDeepgramToken` (`services/deepgram.service.ts`). Both have the same rate limits (30 per minute, 2 per second; `lib/rate-limit/config.ts`).
  - Different on the live route: a 300 s token (the check uses the 30 s default); an ownership check when `interviewId` is passed (404 otherwise); a 403 when another `clientId` holds the session; and a side effect, `markDeepgramStart(interviewId)`, on every token, including each Reconnect.
  - Different endpoint and protocol: the check opens `/v1/listen` (speech-to-text only); the interview opens `/v1/agent/converse` (agent settings, speech output, function calls). A Deepgram project or plan without agent access passes the check and fails the interview.
  - The live hook maps every token failure (403 takeover, 404, 429, 5xx) to the same `voiceStartFailed` message, so the room cannot tell these apart; it offers Reconnect for all of them.
  - A check route can't simply reuse `/api/interview/voice/token` with an `interviewId`: that would record a Deepgram start on the interview. A no-`interviewId` call to that route avoids the side effect but still doesn't test the agent endpoint.

## FDI-023: useDeepgram can leave the microphone open

- **Found during**: Voice check redesign
- **Location**: `hooks/useDeepgram.ts`
  - `socket.onerror` and an unclean `onclose` set the error state but don't call `cleanup()`, so the microphone stream stays open while the error shows.
  - `connect()` skips duplicates by reading `state` from the last render, so two calls in the same tick both run. The second overwrites `streamRef` and `socketRef`, and the first stream and socket are never released.
  - A retry after a socket error also overwrites `streamRef` without stopping the previous stream.
- **Impact**: The browser's microphone indicator can stay on, and an open stream can outlive the page after a client-side navigation (only the latest stream is stopped on unmount).
- **Evidence**: Browser-tested with mocked `getUserMedia`/`WebSocket` (harness, deleted afterwards): two same-tick starts opened two streams and two sockets; a socket error kept the stream until retry or leave. The redesigned page avoids all three cases without touching the hook: a synchronous guard allows one start at a time, and Try again calls the hook's own `disconnect()` before reconnecting (verified: the old track is stopped before the new microphone request).
- **Investigate**: In the hook, release the stream on socket error or unclean close, guard `connect()` with a ref instead of render state, and stop any existing stream before requesting a new one.

## FDI-024: Voice check confirms permission, not that audio is captured

- **Found during**: Voice check redesign
- **Location**: `hooks/useDeepgram.ts` (opens the microphone stream but never reads or sends audio)
- **Impact**: A muted or wrong input device still passes the check; the user only finds out in the interview.
- **Evidence**: Read. The page does not show an input level or claim that sound was heard.
- **Investigate**: Product decision on adding a real input-level indicator (Web Audio analyser on the existing stream) to the check.

## FDI-025: Natural completion can send `POST /api/interview/end` more than once

- **Found during**: Live interview redesign (2026-10-12)
- **Location**: `components/interview/VoiceInterview.tsx` (natural-completion effect: 2.5 s after any finishing state, `POST /api/interview/end`, then `goToReport`); `hooks/useVoiceAgent.ts` (`advanceTurn` schedules `finishInterview` 5 s after the last answer, which also POSTs `/api/interview/end`)
- **Impact**: Normally the page posts first and `goToReport` calls `stop()`, which sets `finishedRef` so the hook's later call returns early. If the page's request takes longer than about 2.5 s, the hook's call starts before `stop()`. Its move to `EVALUATING` also restarts the page's timer while `navigatedRef` is still unset, so a third request is possible. The end route is mostly idempotent (cached report check, `upsert` on the job, `finalizeDeepgram` checks status first), but concurrent requests can race on the job `upsert` (unique `interviewId`) and on `finalizeDeepgram`'s read-then-write, and each one triggers `process-reports`.
- **Evidence**: Read. Simulated in the browser with stubbed APIs (harness, deleted afterwards): with a fast end response, exactly one `POST /end` and one report navigation. The slow-response case was not simulated.
- **Investigate**: Have one owner for ending (the hook or the page), or set the page's guard before the request instead of after it. Confirm the end route tolerates concurrent calls.

## FDI-026: Interview duration is not available to the live room

- **Found during**: Live interview redesign
- **Location**: `GET /api/interview/[id]` returns `startedAt`, but `hooks/useInterview.ts` does not keep it (`types/interview.ts` has no `startedAt`); `services/answer.service.ts` sets `startedAt` only when the first answer is saved
- **Impact**: The old room showed a timer that started when the component mounted, so it reset on every reconnect or reload and did not reflect the interview's real duration. The redesign removed it rather than show a misleading number. Progress ("Question X of Y") comes from the hook and is real.
- **Evidence**: Read.
- **Investigate**: Product decision on whether a duration is wanted. If so, record when the voice session first starts and expose it to the client, or show elapsed time since `startedAt` and label it as time since the first answer.
- **Also affects `/reports/[id]` (2026-10-19)**: the old report card showed a duration computed from `startedAt` to `endedAt`, i.e. from the first saved answer, not from the start of the interview. The redesigned page leaves it out.

## FDI-027: Evaluation scores are saved without validation

- **Found during**: Reports list redesign (2026-10-12)
- **Location**: `services/interview.service.ts` (the evaluator's JSON is read with `parseJSON` and no schema); `lib/ai/prompts/evaluation.ts` asks for `0-100`; `prisma/schema.prisma` `Report` stores every score as `Float`
- **Impact**: Nothing guarantees a score is a whole number between 0 and 100. A fractional or out-of-range value is saved and shown as stored, and it skews the average on the dashboard and `/reports`. The redesigned list rounds scores for display and keeps the score bar inside its track, but it shows the stored number (for example `130/100`) rather than hiding bad data. A missing or non-numeric score would fail at save time or reach the UI as `null`; the list shows "No score" in that case.
- **Evidence**: Read. Simulated in the browser with stubbed responses (harness, deleted afterwards): 72.5 displayed as 73, 130 and -3 displayed as stored with the bar clamped.
- **Investigate**: Validate the evaluation with a schema before saving (integers, 0-100, all fields present), and retry or fail the job when it doesn't match.

## FDI-028: Per-question feedback is generated but never stored

- **Found during**: Reports list redesign
- **Location**: `services/report.service.ts`: `saveReport` returns `questionFeedback` but does not persist it (the `Report` model has no field for it), and `prismaReportToReport` always returns `questionFeedback: []`
- **Impact**: The evaluator produces feedback and a 0-10 score for each question, but it is lost once the job finishes. The report page's per-question section never renders for a saved report. The `/reports` copy avoids promising question-by-question feedback for this reason.
- **Evidence**: Read only.
- **Investigate**: Store per-question feedback (a JSON column or a related table) or stop requesting it from the evaluator. Decide before the `/reports/[id]` redesign.
- **Also affects `/reports/[id]` (2026-10-19)**: the redesigned page has no per-question section, since the data is always empty.

## FDI-029: Report history is unpaginated and returns full report bodies

- **Found during**: Reports list redesign
- **Location**: `app/api/interview/history/route.ts` -> `services/report.service.ts` `listReports` (`findMany` with no limit)
- **Impact**: Every visit to the dashboard or `/reports` downloads every report the user has, including strengths, weaknesses, missing topics and recommendations, which the list does not show. The payload grows with each interview. The list renders 20 rows at a time, but that does not reduce the download.
- **Evidence**: Read.
- **Investigate**: Add a summary shape (id, interview context, overall score, dates) with cursor pagination for lists, and keep full bodies for the report page.

## FDI-030: Historical progress is generated but not stored

- **Found during**: Report detail redesign (2026-10-19)
- **Location**: `lib/ai/evaluationPromptBuilder.ts` asks for `historicalProgress` when past interviews exist; `services/interview.service.ts` returns it; `app/api/cron/process-reports/route.ts` passes only `overallTrend` to `persistInterviewMemory`; `services/report.service.ts` (`saveReport`, `prismaReportToReport`) never stores or returns it
- **Impact**: The comparison with past sessions (improved, regressed, stable, still weak) is produced and then lost. The old report card had a "Progress vs. past sessions" section that could never render; the redesigned page does not show one.
- **Evidence**: Read only.
- **Investigate**: Product decision: store it with the report (and show it), or stop asking the evaluator for it.

## FDI-031: Every category is scored for every interview type

- **Found during**: Report detail redesign
- **Location**: `lib/ai/prompts/evaluation.ts` requires all five category scores (technical, communication, confidence, behavioral, problem solving) as numbers; `prisma/schema.prisma` stores them as non-null `Float`
- **Impact**: A behavioral interview still gets a technical score and a technical interview a behavioral score, with no way to mark a category as not assessed. The report page shows every category that has a number, labelled as scored by an AI evaluator, and cannot tell which ones are meaningful for the interview type.
- **Evidence**: Read only.
- **Investigate**: Decide which categories apply to each interview type; allow null (not assessed) in the schema and prompt, and show only assessed categories.
