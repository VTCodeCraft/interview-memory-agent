import { describe, expect, it } from "vitest";

import { FRIENDLY } from "../../../lib/utils/messages";
import { VOICE_AGENT_STATES } from "../../../types/voiceAgent";
import { FINISHING_STATES, currentQuestionText, errorGuidance, progressLabel, roomStatus } from "./room-state";

describe("roomStatus", () => {
  it("maps every conversation state to a room mode", () => {
    for (const state of VOICE_AGENT_STATES) {
      const status = roomStatus(state);
      expect(status.label.length).toBeGreaterThan(0);
      expect(status.hint.length).toBeGreaterThan(0);
    }
  });

  it("separates the interviewer speaking from the candidate's turn", () => {
    expect(roomStatus("ASKING_QUESTION").mode).toBe("speaking");
    expect(roomStatus("OPTIONAL_REPEAT").mode).toBe("speaking");
    expect(roomStatus("WAITING_FOR_FIRST_RESPONSE").mode).toBe("your-turn");
    expect(roomStatus("USER_ANSWERING").mode).toBe("listening");
    expect(roomStatus("SAVE_TRANSCRIPT").mode).toBe("working");
    expect(roomStatus("THANK_CANDIDATE").mode).toBe("finishing");
    expect(roomStatus("REPORT_READY").mode).toBe("complete");
    expect(roomStatus("ERROR").mode).toBe("error");
  });

  it("keeps the existing completion states", () => {
    expect(FINISHING_STATES).toEqual(["THANK_CANDIDATE", "WAIT_FOR_BACKEND", "EVALUATING", "REPORT_READY"]);
  });
});

describe("errorGuidance", () => {
  it("offers reconnect only for errors a reload can recover", () => {
    expect(errorGuidance(FRIENDLY.connectionLost).canReconnect).toBe(true);
    expect(errorGuidance(FRIENDLY.voiceStartFailed).canReconnect).toBe(true);
    expect(errorGuidance("Microphone permission denied").canReconnect).toBe(true);
    expect(errorGuidance("No microphone found").canReconnect).toBe(true);
    expect(errorGuidance("Session taken over by another device.").canReconnect).toBe(false);
    expect(errorGuidance("Evaluation failed").canReconnect).toBe(false);
  });

  it("never echoes unknown error text", () => {
    expect(errorGuidance("PrismaClientKnownRequestError internals").text).not.toContain("Prisma");
  });
});

describe("progress", () => {
  it("labels progress only once questions exist", () => {
    expect(progressLabel(0, 0)).toBeNull();
    expect(progressLabel(2, 8)).toBe("Question 2 of 8");
    expect(progressLabel(9, 8)).toBe("Question 8 of 8");
  });

  it("finds the current question by sequence", () => {
    const questions = [
      { sequence: 2, prompt: "Second" },
      { sequence: 1, prompt: "First" },
    ];
    expect(currentQuestionText(questions, 0)).toBeNull();
    expect(currentQuestionText(questions, 1)).toBe("First");
    expect(currentQuestionText(questions, 2)).toBe("Second");
    expect(currentQuestionText(questions, 3)).toBeNull();
  });
});
