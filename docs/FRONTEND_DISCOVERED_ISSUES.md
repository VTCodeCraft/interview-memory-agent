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

---

## Deferred frontend items

Visual or navigation items outside the current page's scope, kept for the phase
that owns them. These are not logic issues.

| ID | Item | Location | Deferred to |
|---|---|---|---|
| FE-001 | Account menu icons use Material Symbols; Precision uses Lucide (stroke 1.75) | `components/common/AccountMenu.tsx` (`MenuIcon`) | Shared app navigation |
| FE-002 | Account menu "My Dashboard" during onboarding goes to `/interviews`, which sends incomplete users straight back to onboarding | `components/common/AccountMenu.tsx`, used by `app/onboarding/layout.tsx` | Shared app navigation |
| FE-003 | `Footer` `variant="minimal"` is no longer used (onboarding has its own footer) | `components/Footer.tsx` | Clean-up with the legal pages or the shared layout |

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
