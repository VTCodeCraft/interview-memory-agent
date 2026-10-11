import type { Metadata } from "next";
import Link from "next/link";

import Logo from "@/components/landing-page/Logo";
import { requireOnboardedUser } from "@/lib/auth/app-user";
import { ROUTES } from "@/lib/utils/constants";
import {
  getOwnedInterview,
  isActiveInterviewStatus,
} from "@/services/interviewAccess.service";
import { VoiceCheck } from "./_components/VoiceCheck";

export const metadata: Metadata = {
  title: "Voice check | Clutchly",
};

/**
 * /interviews/check: pre-interview readiness check (voice token, microphone
 * permission, voice WebSocket). Reached from /interviews/new with
 * `?interview=<id>` once questions are generated; also usable standalone.
 * Continue is only offered for an active interview owned by the signed-in
 * user, and only enabled once the check passes.
 *
 * Like the live interview, this is a focused screen: AppShell hides the
 * product navigation here, so the page brings its own minimal header.
 */
export default async function InterviewCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ interview?: string | string[] }>;
}) {
  const { interview } = await searchParams;
  const user = await requireOnboardedUser();

  let continueId: string | null = null;
  if (typeof interview === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(interview)) {
    const owned = await getOwnedInterview(user.id, interview);
    if (owned && isActiveInterviewStatus(owned.status)) continueId = owned.id;
  }

  return (
    <div className="ds-page flex min-h-dvh flex-1 flex-col">
      <header className="border-b border-line-subtle">
        <div className="ds-container flex h-nav items-center justify-between gap-6">
          <Logo />
          <Link
            href={ROUTES.interviews}
            className="inline-flex min-h-9 items-center rounded-control px-3 text-small font-medium text-fg-muted transition-[color,background-color] duration-(--duration-fast) ease-standard hover:bg-sunken hover:text-fg focus-ring"
          >
            Exit
          </Link>
        </div>
      </header>

      <main className="ds-container flex-1 pt-8 pb-16 sm:pt-12 lg:pt-16">
        <div className="mx-auto max-w-[40rem]">
          <p className="text-small font-medium text-fg-muted">{continueId ? "Before your interview" : "Voice check"}</p>
          <h1 className="ds-display mt-2 text-title text-balance text-fg">Check your microphone and connection</h1>
          <p className="mt-2 text-body text-fg-muted">
            Your interview is spoken, so make sure your browser can use your microphone and reach the voice service.
          </p>
          <div className="mt-8">
            <VoiceCheck continueId={continueId} />
          </div>
        </div>
      </main>
    </div>
  );
}
