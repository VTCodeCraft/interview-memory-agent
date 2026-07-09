import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { saveInterviewAnswer } from "@/services/answer.service";

const bodySchema = z.object({
  interviewId: z.string().min(1, "Interview ID is required"),
  sequence: z.number().int().positive(),
  transcript: z.string().optional(),
  text: z.string().optional(),
  duration: z.number().int().nonnegative().optional(),
  durationSec: z.number().int().nonnegative().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const transcript = parsed.data.transcript ?? parsed.data.text;
    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Transcript is required" },
        { status: 400 }
      );
    }

    const result = await saveInterviewAnswer({
      interviewId: parsed.data.interviewId,
      userId: user.id,
      sequence: parsed.data.sequence,
      transcript,
      duration: parsed.data.duration ?? parsed.data.durationSec ?? 0,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === "INTERVIEW_NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "Interview not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to save answer" },
      { status: 500 }
    );
  }
}
