/**
 * Server-side error sanitization.
 *
 * API routes must NEVER return provider internals to the client: no Gemini
 * stack traces, no Deepgram protocol errors, no status codes, no URLs, no raw
 * exception messages. Detailed errors are logged server-side only; the client
 * receives a friendly, safe message via {@link toFriendlyError}.
 */

import { FRIENDLY } from "./messages";

/**
 * Allowlist of messages that are our own, intentionally safe, non-provider
 * strings. These may pass through to the client unchanged. Everything else is
 * replaced with a friendly fallback.
 */
const SAFE_MESSAGES = new Set<string>([
  "Unauthorized",
  "User not found",
  "Interview not found",
  "Profile not found",
  "Parsed resume not found",
  "Interview configuration is incomplete",
  "No questions to conduct",
  "Interview limit reached",
  FRIENDLY.voiceStartFailed,
  FRIENDLY.connectionLost,
  FRIENDLY.microphone,
  FRIENDLY.inactive,
]);

/**
 * Map any thrown error to a client-safe message.
 *
 * @param reason      the caught error (logged server-side by the caller)
 * @param fallback    friendly message to show when the error is not on the
 *                     allowlist. Defaults to the generic AI-outage message.
 * @returns           either the safe allowlisted message or `fallback`.
 */
export function toFriendlyError(
  reason: unknown,
  fallback: string = FRIENDLY.aiUnavailable,
): string {
  const message =
    reason instanceof Error ? reason.message : typeof reason === "string" ? reason : "";

  if (message && SAFE_MESSAGES.has(message)) return message;
  return fallback;
}
