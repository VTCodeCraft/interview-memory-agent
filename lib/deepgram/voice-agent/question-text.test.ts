import { describe, expect, it } from "vitest";

import { spokenQuestionText } from "./question-text";

const card = "Tell me about your experience developing the IVR Solution at Founders' Cart.";
const generated = "I saw on your resume that you developed an IVR Solution for monday.com.";

describe("spokenQuestionText", () => {
  it("speaks the card text from the backend, not the separately generated phrasing", () => {
    expect(spokenQuestionText({ displayQuestion: card, ttsTranscript: generated })).toBe(card);
  });

  it("speaks the card text from the interview payload (prompt)", () => {
    expect(spokenQuestionText({ prompt: card, ttsTranscript: generated })).toBe(card);
  });

  it("falls back to the generated phrasing only when there is no card text", () => {
    expect(spokenQuestionText({ prompt: "  ", ttsTranscript: generated })).toBe(generated);
    expect(spokenQuestionText({ displayQuestion: null, ttsTranscript: ` ${generated} ` })).toBe(generated);
  });

  it("returns an empty string when there is nothing to say", () => {
    expect(spokenQuestionText({})).toBe("");
  });
});
