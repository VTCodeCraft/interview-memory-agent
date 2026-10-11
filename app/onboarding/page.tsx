import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getAppUser } from "@/lib/auth/app-user";
import { sanitizeAppRedirect } from "@/lib/routing/redirect";
import { ROUTES } from "@/lib/utils/constants";
import OnboardingForm from "./OnboardingForm";
import type { Difficulty, OnboardingInitial, SavedResume } from "./_components/options";

export const metadata: Metadata = {
  title: "Set up your coach | Clutchly",
};

const EMPTY_PROFILE: OnboardingInitial = {
  experience: "",
  targetRole: "",
  githubUrl: "",
  linkedinUrl: "",
  preferredDifficulty: "MEDIUM",
  targetCompanies: [],
  interviewTypes: [],
};

/**
 * Whatever the user already saved (a partly finished setup, or a profile
 * whose resume is missing), so they never re-enter it or re-upload a resume
 * that is already on file.
 */
async function loadSavedSetup(userId: string): Promise<{ initial: OnboardingInitial; resume: SavedResume | null }> {
  const [profile, resume] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { userId },
      select: {
        experience: true,
        targetRole: true,
        githubUrl: true,
        linkedinUrl: true,
        preferredDifficulty: true,
        targetCompanies: true,
        interviewTypes: true,
      },
    }),
    prisma.resume.findFirst({
      where: { userId },
      orderBy: { uploadedAt: "desc" },
      select: { originalFileName: true, pageCount: true, uploadedAt: true },
    }),
  ]);

  return {
    initial: profile
      ? {
          experience: profile.experience ?? "",
          targetRole: profile.targetRole ?? "",
          githubUrl: profile.githubUrl ?? "",
          linkedinUrl: profile.linkedinUrl ?? "",
          preferredDifficulty: profile.preferredDifficulty as Difficulty,
          targetCompanies: profile.targetCompanies,
          interviewTypes: profile.interviewTypes,
        }
      : EMPTY_PROFILE,
    resume: resume
      ? { fileName: resume.originalFileName, pages: resume.pageCount, uploadedAt: resume.uploadedAt.toISOString() }
      : null,
  };
}

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

  // No database user yet (Clerk sync still pending): start from a blank form;
  // the API routes sync the user again before saving.
  const saved = state.user
    ? await loadSavedSetup(state.user.id)
    : { initial: EMPTY_PROFILE, resume: null };

  return <OnboardingForm next={nextPath} initial={saved.initial} savedResume={saved.resume} />;
}
