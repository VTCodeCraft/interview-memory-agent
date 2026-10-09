import "server-only";

import { InterviewStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

/** Statuses an interview can be resumed from (mirrors /api/interview/active). */
export const ACTIVE_INTERVIEW_STATUSES: readonly InterviewStatus[] = [
  InterviewStatus.PENDING,
  InterviewStatus.GENERATING,
  InterviewStatus.READY,
  InterviewStatus.ONGOING,
];

export function isActiveInterviewStatus(status: InterviewStatus): boolean {
  return ACTIVE_INTERVIEW_STATUSES.includes(status);
}

/**
 * Interview id + status, only if it belongs to `userId`. Unknown ids and other
 * users' interviews both return null so callers can respond with a 404.
 */
export async function getOwnedInterview(userId: string, interviewId: string) {
  return prisma.interview.findFirst({
    where: { id: interviewId, userId },
    select: { id: true, status: true },
  });
}
