import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getAppUser } from "@/lib/auth/app-user";
import { sanitizeAppRedirect } from "@/lib/routing/redirect";
import { ROUTES } from "@/lib/utils/constants";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const nextPath = sanitizeAppRedirect(typeof next === "string" ? next : null);

  const state = await getAppUser();
  if (!state) {
    // proxy.ts already requires a session for /onboarding.
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  // Returning users who already finished onboarding go straight through.
  if (state.user?.onboardingComplete) {
    redirect(nextPath ?? ROUTES.interviews);
  }

  return <OnboardingForm next={nextPath} />;
}
