import { InterviewStatus } from "@prisma/client";

/**
 * Thrown by createInterviewSession when the user already has an active
 * interview (status PENDING | GENERATING | READY | ONGOING).
 *
 * Extends Error so:
 *  - instanceof works reliably in catch blocks.
 *  - Stack traces are preserved for debugging.
 *  - Tooling (Sentry, etc.) can filter it out by name.
 *
 * @example
 *   if (err instanceof ActiveInterviewError) {
 *     // expected control-flow — skip error logging
 *   }
 */
export class ActiveInterviewError extends Error {
  readonly code = "ACTIVE_INTERVIEW_EXISTS" as const;

  constructor(
    public readonly interviewId: string,
    public readonly status: InterviewStatus,
  ) {
    super("Active interview exists");
    this.name = "ActiveInterviewError";
  }
}
