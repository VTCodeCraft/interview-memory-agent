/*
 * Pure view logic for the voice check (no imports, so Vitest runs it as is).
 * The check is what hooks/useDeepgram already does, in order:
 *   1. GET /api/speech/token for a short-lived voice token
 *   2. getUserMedia({ audio: true }) for microphone access
 *   3. open the Deepgram WebSocket (kept alive until you leave or stop)
 * The hook exposes one state plus an error message; the step a failure
 * belongs to is read from that message (the hook's own fixed strings).
 */

/** Mirrors DeepgramConnectionState in hooks/useDeepgram.ts. */
export type CheckState = "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "ERROR";
export type Step = "token" | "microphone" | "connection";
export type StepState = "pending" | "active" | "done" | "failed";

const MIC_ERRORS = ["Microphone permission denied", "No microphone found", "Could not access the microphone"];

export function failedStep(error: string | null): Step | null {
  if (!error) return null;
  if (error.startsWith("Token request failed")) return "token";
  if (MIC_ERRORS.includes(error)) return "microphone";
  return "connection";
}

/** Plain-language guidance for each failure the hook reports (never the raw server text). */
export function guidance(error: string): { title: string; text: string } {
  if (error === "Microphone permission denied") {
    return {
      title: "Microphone access is blocked",
      text: "Allow microphone access for this site in your browser's settings (usually the icon next to the address bar), then try again.",
    };
  }
  if (error === "No microphone found") {
    return { title: "No microphone found", text: "Connect a microphone or headset, then try again." };
  }
  if (error === "Could not access the microphone") {
    return {
      title: "Your microphone couldn't be opened",
      text: "Another app may be using it. Close other calls or recorders, then try again.",
    };
  }
  if (error.startsWith("Token request failed")) {
    return { title: "The voice service didn't respond", text: "This is usually temporary. Try again in a moment." };
  }
  if (error === "Deepgram connection lost") {
    return { title: "The voice connection dropped", text: "Check your network, then try again." };
  }
  return {
    title: "The voice connection couldn't be opened",
    text: "A network, VPN or firewall may be blocking it. Check your connection, then try again.",
  };
}

/**
 * Per-step display state. While connecting, only the token step reports
 * completion (the hook sets its expiry); microphone and connection show as
 * checking until the whole check passes or fails.
 */
export function stepStates(state: CheckState, error: string | null, tokenReady: boolean): Record<Step, StepState> {
  if (state === "CONNECTED") return { token: "done", microphone: "done", connection: "done" };
  if (state === "CONNECTING") {
    return tokenReady
      ? { token: "done", microphone: "active", connection: "active" }
      : { token: "active", microphone: "pending", connection: "pending" };
  }
  if (state === "ERROR") {
    const failed = failedStep(error);
    if (failed === "token") return { token: "failed", microphone: "pending", connection: "pending" };
    if (failed === "microphone") return { token: "done", microphone: "failed", connection: "pending" };
    return { token: "done", microphone: "done", connection: "failed" };
  }
  return { token: "pending", microphone: "pending", connection: "pending" };
}

/** Continue is only possible once the whole check has passed. */
export function canContinue(state: CheckState, opening: boolean): boolean {
  return state === "CONNECTED" && !opening;
}
