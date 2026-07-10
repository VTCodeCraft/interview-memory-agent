/**
 * Centralized user-facing messages.
 *
 * Every string a candidate or interviewer can see at runtime lives here so we
 * never leak provider internals (Gemini stack traces, Deepgram protocol errors,
 * status codes, URLs). Import these constants wherever we surface an error or
 * status to the UI / voice agent.
 */

export const FRIENDLY = {
  /** Generic AI/provider outage — used for Gemini 429/5xx after retries fail. */
  aiUnavailable:
    "We're experiencing temporary AI service issues. Please try again in a few moments.",
  /** Slightly shorter variant for retry exhaustion. */
  aiRetry:
    "We're experiencing temporary AI service issues. Please try again shortly.",

  /** Voice / Deepgram socket dropped unexpectedly. */
  connectionLost: "Connection lost. Please try again.",

  /** Microphone disconnected or unavailable. */
  microphone:
    "Microphone disconnected. Please check your microphone and try again.",

  /** Candidate went quiet mid-interview (no barge-in, no transcript). */
  inactive:
    "We haven't heard anything for a while. Please continue speaking or reconnect.",

  /** Token / handshake failure before the session could start. */
  voiceStartFailed:
    "We couldn't start the voice session. Please check your connection and try again.",
} as const;

export type FriendlyMessage = (typeof FRIENDLY)[keyof typeof FRIENDLY];
