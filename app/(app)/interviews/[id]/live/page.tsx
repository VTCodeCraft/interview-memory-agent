import { notFound, redirect } from "next/navigation";

import { requireOnboardedUser } from "@/lib/auth/app-user";
import { routeTo } from "@/lib/utils/constants";
import {
  getOwnedInterview,
  isActiveInterviewStatus,
} from "@/services/interviewAccess.service";
import LiveInterviewSession from "./LiveInterviewSession";

/** /interviews/[id]/live — `id` is an Interview id owned by the signed-in user. */
export default async function LiveInterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireOnboardedUser();

  const interview = await getOwnedInterview(user.id, id);
  // Unknown ids and other users' interviews are indistinguishable.
  if (!interview) notFound();

  // Completed, cancelled and failed sessions cannot be resumed; the report
  // route shows the right state (ready, processing or unavailable).
  if (!isActiveInterviewStatus(interview.status)) {
    redirect(routeTo.report(interview.id));
  }

  return <LiveInterviewSession interviewId={interview.id} />;
}
