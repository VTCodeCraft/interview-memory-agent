import { describe, expect, it } from "vitest";

import {
  detailsFrom,
  detailsPayload,
  errorsFor,
  firstPick,
  goalFromInput,
  preferencesFrom,
  preferencesPayload,
  sameValues,
  serverFieldErrors,
  toggleChoice,
  validateDetails,
  validatePreferences,
  withSaved,
} from "./settings-data";

describe("loading saved values", () => {
  it("uses only what the account has saved", () => {
    expect(detailsFrom(null)).toEqual({ experience: "", githubUrl: "", linkedinUrl: "" });
    expect(preferencesFrom(null)).toEqual({ targetRole: "", preferredDifficulty: "MEDIUM", targetCompanies: [], interviewTypes: [] });
    expect(
      preferencesFrom({ targetRole: "Frontend Engineer", preferredDifficulty: "HARD", targetCompanies: ["Stripe", "Google"], interviewTypes: ["system_design"] }),
    ).toEqual({ targetRole: "Frontend Engineer", preferredDifficulty: "HARD", targetCompanies: ["Stripe", "Google"], interviewTypes: ["system_design"] });
  });

  it("ignores malformed lists and levels", () => {
    expect(preferencesFrom({ preferredDifficulty: "EXTREME" as never, targetCompanies: "Google" as never, interviewTypes: [1, "technical"] as never })).toMatchObject({
      preferredDifficulty: "MEDIUM",
      targetCompanies: [],
      interviewTypes: ["technical"],
    });
  });
});

describe("validation and payloads", () => {
  it("accepts empty links, rejects partial ones", () => {
    expect(validateDetails({ experience: "", githubUrl: "", linkedinUrl: " " })).toEqual({});
    expect(validateDetails({ experience: "", githubUrl: "github.com/me", linkedinUrl: "https://linkedin.com/in/me" })).toEqual({
      githubUrl: "Enter a full link starting with https://",
    });
    expect(validateDetails({ experience: "", githubUrl: "ftp://x.y", linkedinUrl: "" }).githubUrl).toBeDefined();
  });

  it("leaves out an empty experience, which the server would reject", () => {
    expect(detailsPayload({ experience: "", githubUrl: " https://github.com/me ", linkedinUrl: "" })).toEqual({ githubUrl: "https://github.com/me", linkedinUrl: "" });
    expect(detailsPayload({ experience: "3-5 Years", githubUrl: "", linkedinUrl: "" })).toMatchObject({ experience: "3-5 Years" });
  });

  it("requires a target role and trims it", () => {
    expect(validatePreferences({ targetRole: "  ", preferredDifficulty: "MEDIUM", targetCompanies: [], interviewTypes: [] })).toEqual({
      targetRole: "Enter the role you're preparing for.",
    });
    expect(preferencesPayload({ targetRole: " Backend Engineer ", preferredDifficulty: "EASY", targetCompanies: ["Meta"], interviewTypes: [] })).toEqual({
      targetRole: "Backend Engineer",
      preferredDifficulty: "EASY",
      targetCompanies: ["Meta"],
      interviewTypes: [],
    });
  });

  it("reads field messages from a validation response", () => {
    expect(serverFieldErrors(["githubUrl: Invalid GitHub URL", "targetCompanies.0: Expected string", 5, "nonsense"])).toEqual({
      githubUrl: "Invalid GitHub URL",
      targetCompanies: "Expected string",
    });
    expect(serverFieldErrors(undefined)).toEqual({});
  });

  it("keeps only the messages a form can show", () => {
    const values = { experience: "", githubUrl: "", linkedinUrl: "" };
    expect(errorsFor({ githubUrl: "Invalid GitHub URL", targetRole: "Required" }, values)).toEqual({ githubUrl: "Invalid GitHub URL" });
    expect(errorsFor(undefined, values)).toEqual({});
  });
});

describe("change tracking", () => {
  it("treats list order as a change, because the first pick is preselected", () => {
    const base = { targetRole: "Engineer", preferredDifficulty: "MEDIUM" as const, targetCompanies: ["Google", "Meta"], interviewTypes: [] };
    expect(sameValues(base, { ...base })).toBe(true);
    expect(sameValues(base, { ...base, targetRole: " Engineer " })).toBe(true);
    expect(sameValues(base, { ...base, targetCompanies: ["Meta", "Google"] })).toBe(false);
  });
});

describe("multi-select", () => {
  it("adds in order, removes, and tags the first pick only when there are several", () => {
    expect(toggleChoice(["Google"], "Meta", true)).toEqual(["Google", "Meta"]);
    expect(toggleChoice(["Google", "Meta"], "Google", false)).toEqual(["Meta"]);
    expect(toggleChoice(["Google"], "Google", true)).toEqual(["Google"]);
    expect(firstPick(["Google"], "Google")).toBeUndefined();
    expect(firstPick(["Google", "Meta"], "Google")).toBe("First pick");
    expect(firstPick(["Google", "Meta"], "Meta")).toBeUndefined();
  });

  it("keeps saved values that aren't in the fixed options", () => {
    expect(withSaved(["Google", "Meta"], ["Stripe", "Google", ""])).toEqual(["Google", "Meta", "Stripe"]);
  });
});

describe("weekly goal", () => {
  it("accepts whole numbers from 1, nothing else", () => {
    expect(goalFromInput("3")).toBe(3);
    expect(goalFromInput(" 12 ")).toBe(12);
    expect(goalFromInput("0")).toBeNull();
    expect(goalFromInput("")).toBeNull();
    expect(goalFromInput("2.5")).toBeNull();
    expect(goalFromInput("-1")).toBeNull();
  });
});
