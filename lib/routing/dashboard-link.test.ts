import { describe, expect, it } from "vitest";

import { dashboardHref } from "./dashboard-link";

describe("dashboardHref", () => {
  it("sends onboarded users to the dashboard", () => {
    expect(dashboardHref(true)).toBe("/interviews");
    expect(dashboardHref(true, "/reports")).toBe("/interviews");
  });

  it("sends users with incomplete onboarding to onboarding, not the guarded dashboard", () => {
    expect(dashboardHref(false)).toBe("/onboarding");
    expect(dashboardHref(false, null)).toBe("/onboarding");
  });

  it("keeps a safe next destination while onboarding", () => {
    expect(dashboardHref(false, "/reports")).toBe("/onboarding?next=%2Freports");
    expect(dashboardHref(false, "/reports/abc?tab=1")).toBe("/onboarding?next=%2Freports%2Fabc%3Ftab%3D1");
  });

  it("drops unsafe or looping next values", () => {
    expect(dashboardHref(false, "https://evil.example")).toBe("/onboarding");
    expect(dashboardHref(false, "//evil.example")).toBe("/onboarding");
    expect(dashboardHref(false, "/onboarding")).toBe("/onboarding");
    expect(dashboardHref(false, "/")).toBe("/onboarding");
  });
});
