import Link from "next/link";

import { DeepgramStatus } from "@/components/interview/DeepgramStatus";
import { requireOnboardedUser } from "@/lib/auth/app-user";
import { ROUTES, routeTo } from "@/lib/utils/constants";
import {
  getOwnedInterview,
  isActiveInterviewStatus,
} from "@/services/interviewAccess.service";

/**
 * /interviews/check — pre-interview readiness check (Deepgram token, microphone
 * permission, WebSocket). Reached from /interviews/new with `?interview=<id>`
 * once questions are generated; also usable standalone. The Continue link is
 * only offered for an active interview owned by the signed-in user.
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
    <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-6">
      <div className="text-center max-w-[28rem] w-full">
        <h1 className="text-2xl font-extrabold text-on-surface mb-2 tracking-tight">
          Voice Connection Check
        </h1>
        <p className="text-sm text-on-surface-variant">
          Verify the Deepgram voice pipeline connects successfully. Click Connect,
          allow microphone access, and watch for the green status indicator.
        </p>
      </div>
      <DeepgramStatus />
      <div className="flex flex-wrap items-center justify-center gap-3 max-w-[28rem] w-full">
        {continueId ? (
          <Link
            href={routeTo.liveInterview(continueId)}
            className="flex-1 h-10 inline-flex items-center justify-center bg-primary text-white rounded-xl text-xs font-bold hover:bg-[#4338CA] transition-all active:scale-95"
          >
            Continue to Interview
          </Link>
        ) : (
          <Link
            href={ROUTES.newInterview}
            className="flex-1 h-10 inline-flex items-center justify-center bg-primary text-white rounded-xl text-xs font-bold hover:bg-[#4338CA] transition-all active:scale-95"
          >
            Set Up an Interview
          </Link>
        )}
        <Link
          href={ROUTES.interviews}
          className="flex-1 h-10 inline-flex items-center justify-center border border-outline-variant text-on-surface-variant rounded-xl text-xs font-bold hover:bg-surface-container transition-all active:scale-95"
        >
          Back to Interviews
        </Link>
      </div>
    </main>
  );
}
