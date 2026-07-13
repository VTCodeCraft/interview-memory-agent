import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { InterviewStatus } from "@prisma/client";

const ACTIVE_STATUSES = [
  InterviewStatus.PENDING,
  InterviewStatus.GENERATING,
  InterviewStatus.READY,
  InterviewStatus.ONGOING,
];

/**
 * GET /api/interview/active
 *
 * Returns the authenticated user's current active interview, or null if none.
 * Used by the interview page on mount to silently recover a session after a
 * refresh, tab close, or browser restart — without the user having to click anything.
 *
 * The frontend calls this once on load:
 *  - If { interviewId } → calls resume(interviewId) which fetches full session
 *    shape from GET /api/interview/[id] and reconnects Deepgram via VoiceInterview.
 *  - If null → shows the normal interview setup form.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const clientId = url.searchParams.get("clientId");

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const active = await prisma.interview.findFirst({
      where: {
        userId: user.id,
        status: { in: ACTIVE_STATUSES },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true, questions: true },
    });

    if (active && clientId) {
      const parsedQuestions = active.questions as any;
      const activeClientId = parsedQuestions?.activeClientId;
      // If there is an activeClientId and it doesn't match the caller, this device was taken over
      if (activeClientId && activeClientId !== clientId) {
        return NextResponse.json({
          success: true,
          data: { taken_over: true }
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: active
        ? { interviewId: active.id, status: active.status }
        : null,
    });
  } catch (error) {
    console.error("[INTERVIEW_ACTIVE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to check active interview" },
      { status: 500 },
    );
  }
}
