// Relative imports keep this module runnable in Vitest without path aliases.
import { ROUTES, routeTo } from "../utils/constants";
import { sanitizeAppRedirect } from "./redirect";

/**
 * Where "My Dashboard" (account menu, Dashboard buttons) should send a
 * signed-in user. Until onboarding is complete the dashboard is guarded and
 * would only bounce back to /onboarding (overwriting any `next`), so link to
 * onboarding directly and carry a safe `next` through.
 */
export function dashboardHref(onboardingComplete: boolean, next?: string | null): string {
  if (onboardingComplete) return ROUTES.interviews;
  return routeTo.onboarding(sanitizeAppRedirect(next ?? null));
}
