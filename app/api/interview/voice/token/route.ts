import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";

import { isDeepgramConfigured } from "@/lib/deepgram/client";
import { createDeepgramToken } from "@/services/deepgram.service";
import { success, failure, unauthorized } from "@/lib/utils/api";
import { markDeepgramStart } from "@/services/pipelineUsage.service";

const AGENT_TOKEN_TTL_SECONDS = 300;

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return unauthorized();
    }

    if (!isDeepgramConfigured()) {
      return failure("Deepgram is not configured", 501);
    }

    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get("interviewId");
    const clientId = searchParams.get("clientId");

    if (interviewId) {
      // Ownership: tokens are only minted against the caller's own interview,
      // so pipeline usage can't be recorded on someone else's interview.
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
        select: { id: true },
      });
      const interview = dbUser
        ? await prisma.interview.findFirst({
            where: { id: interviewId, userId: dbUser.id },
            select: { questions: true },
          })
        : null;
      if (!interview) {
        return failure("Interview not found", 404);
      }
      if (clientId) {
        const parsed = typeof interview.questions === 'object' && interview.questions !== null
          ? interview.questions as any
          : {};
        if (parsed.activeClientId && parsed.activeClientId !== clientId) {
          return failure("Session taken over by another device", 403);
        }
      }
    }

    const token = await createDeepgramToken(AGENT_TOKEN_TTL_SECONDS);

    if (interviewId) {
      await markDeepgramStart(interviewId);
    }

    return success(token);
  } catch (reason) {
    const message =
      reason instanceof Error ? reason.message : "Failed to create Deepgram token";
    return failure(message, 500);
  }
}
