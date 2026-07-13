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

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await request.json();
    if (!clientId) {
      return NextResponse.json({ success: false, error: "clientId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const interview = await prisma.interview.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        status: { in: ACTIVE_STATUSES },
      },
      select: { id: true, questions: true },
    });

    if (!interview) {
      return NextResponse.json(
        { success: false, error: "Interview not found or not active" },
        { status: 404 }
      );
    }

    // Embed the activeClientId into the questions JSON blob
    // This allows the backend to know which device owns the active session.
    let parsedQuestions = interview.questions as any;
    if (!parsedQuestions) {
       parsedQuestions = {};
    }
    
    // Support both `{ questions: [...] }` and `[...]` shapes just in case
    if (Array.isArray(parsedQuestions)) {
      parsedQuestions = { questions: parsedQuestions, activeClientId: clientId };
    } else {
      parsedQuestions = { ...parsedQuestions, activeClientId: clientId };
    }

    await prisma.interview.update({
      where: { id: interview.id },
      data: { questions: parsedQuestions },
    });

    return NextResponse.json({ success: true, data: { interviewId: interview.id } });
  } catch (error) {
    console.error("[INTERVIEW_TAKEOVER_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to take over interview" },
      { status: 500 }
    );
  }
}
