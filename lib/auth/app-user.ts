import "server-only";

import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { syncCurrentClerkUserToDatabase } from "@/lib/auth/sync-user";
import { APP_PATH_HEADER, sanitizeAppRedirect } from "@/lib/routing/redirect";
import { routeTo } from "@/lib/utils/constants";

export interface AppUser {
  /** Internal database user id (not the Clerk id). */
  id: string;
  clerkId: string;
  onboardingComplete: boolean;
}

export interface AppUserState {
  clerkId: string;
  /** Null when the Clerk user could not be synced into the database yet. */
  user: AppUser | null;
}

const appUserSelect = {
  id: true,
  clerkId: true,
  profile: { select: { experience: true, targetRole: true } },
  _count: { select: { resumes: true } },
} as const;

/**
 * Onboarding is complete when the user has the data the existing onboarding
 * wizard requires (experience + target role, see lib/validations/onboarding.ts)
 * and an uploaded resume — the same prerequisites POST /api/interview/start
 * enforces. An empty profile row alone does not count.
 */
function isOnboardingComplete(user: {
  profile: { experience: string | null; targetRole: string | null } | null;
  _count: { resumes: number };
}): boolean {
  return Boolean(
    user.profile?.experience?.trim() &&
      user.profile?.targetRole?.trim() &&
      user._count.resumes > 0,
  );
}

async function findUser(clerkId: string) {
  return prisma.user.findUnique({ where: { clerkId }, select: appUserSelect });
}

/**
 * The signed-in user and their onboarding status, or null when signed out.
 * Cached per request so layouts and pages share one lookup.
 */
export const getAppUser = cache(async (): Promise<AppUserState | null> => {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  let user = await findUser(clerkId);
  if (!user) {
    // Brand-new account: the root layout's <UserSync /> may not have finished.
    try {
      await syncCurrentClerkUserToDatabase();
    } catch (error) {
      console.error("[AppUser] Unable to sync Clerk user", error);
    }
    user = await findUser(clerkId);
  }

  return {
    clerkId,
    user: user
      ? { id: user.id, clerkId: user.clerkId, onboardingComplete: isOnboardingComplete(user) }
      : null,
  };
});

/** The requested product path (set by proxy.ts), if it is a safe redirect target. */
async function requestedAppPath(): Promise<string | null> {
  const requestHeaders = await headers();
  return sanitizeAppRedirect(requestHeaders.get(APP_PATH_HEADER));
}

/**
 * Guard for every signed-in product route. Signed-out users go to Clerk
 * sign-in; users with incomplete onboarding go to /onboarding with the
 * requested path preserved as `?next=`.
 */
export async function requireOnboardedUser(): Promise<AppUser> {
  const state = await getAppUser();

  if (!state) {
    // proxy.ts already protects these routes; this is defence in depth.
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  if (!state.user?.onboardingComplete) {
    redirect(routeTo.onboarding(await requestedAppPath()));
  }

  return state.user;
}
