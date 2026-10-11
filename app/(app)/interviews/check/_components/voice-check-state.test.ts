import { describe, expect, it } from "vitest";

import { canContinue, failedStep, guidance, stepStates } from "./voice-check-state";

describe("failedStep", () => {
  it("maps each hook error to the step that failed", () => {
    expect(failedStep(null)).toBeNull();
    expect(failedStep("Token request failed: Deepgram is not configured")).toBe("token");
    expect(failedStep("Microphone permission denied")).toBe("microphone");
    expect(failedStep("No microphone found")).toBe("microphone");
    expect(failedStep("Could not access the microphone")).toBe("microphone");
    expect(failedStep("Deepgram WebSocket connection failed")).toBe("connection");
    expect(failedStep("Deepgram connection lost")).toBe("connection");
  });
});

describe("stepStates", () => {
  it("starts with nothing checked", () => {
    expect(stepStates("DISCONNECTED", null, false)).toEqual({ token: "pending", microphone: "pending", connection: "pending" });
  });

  it("shows the token step first, then microphone and connection as checking", () => {
    expect(stepStates("CONNECTING", null, false)).toEqual({ token: "active", microphone: "pending", connection: "pending" });
    expect(stepStates("CONNECTING", null, true)).toEqual({ token: "done", microphone: "active", connection: "active" });
  });

  it("marks only the failed step, never a later one as passed", () => {
    expect(stepStates("ERROR", "Token request failed: x", false)).toEqual({ token: "failed", microphone: "pending", connection: "pending" });
    expect(stepStates("ERROR", "Microphone permission denied", true)).toEqual({ token: "done", microphone: "failed", connection: "pending" });
    expect(stepStates("ERROR", "Deepgram WebSocket connection failed", true)).toEqual({ token: "done", microphone: "done", connection: "failed" });
  });

  it("passes everything only when connected", () => {
    expect(stepStates("CONNECTED", null, true)).toEqual({ token: "done", microphone: "done", connection: "done" });
  });
});

describe("guidance", () => {
  it("never shows raw server text for token failures", () => {
    const message = guidance("Token request failed: PrismaClientKnownRequestError internals");
    expect(message.title).toBe("The voice service didn't respond");
    expect(message.text).not.toContain("Prisma");
  });

  it("explains how to fix a blocked microphone", () => {
    expect(guidance("Microphone permission denied").title).toBe("Microphone access is blocked");
  });
});

describe("canContinue", () => {
  it("is only true once connected and not already opening", () => {
    expect(canContinue("DISCONNECTED", false)).toBe(false);
    expect(canContinue("CONNECTING", false)).toBe(false);
    expect(canContinue("ERROR", false)).toBe(false);
    expect(canContinue("CONNECTED", false)).toBe(true);
    expect(canContinue("CONNECTED", true)).toBe(false);
  });
});
