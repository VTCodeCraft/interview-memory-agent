/**
 * DELETE /api/cognee/forget
 *
 * Phase 7 – Cognee Memory Lifecycle.
 *
 * Permanently removes all Cognee memories for the authenticated user.
 * This is called during account deletion workflows. It should NOT be
 * called for normal interview cancellation or individual report deletion.
 *
 * Request body:
 *   { "userId": "<internal app userId>" }
 *
 * The caller must be the same authenticated user as the userId being deleted,
 * or this must be triggered from a trusted server-side webhook context.
 *
 * Responses:
 *   200  { success: true, data: { datasetDeleted: true, message: "..." } }
 *   400  { success: false, error: "userId required" }
 *   401  { success: false, error: "unauthorized" }
 *   403  { success: false, error: "forbidden" }
 *   500  { success: false, error: "..." }
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { ok, fail, errorResponse } from "@/lib/utils/api";
import { forget } from "@/services/cognee.service";

const bodySchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(fail("unauthorized"), { status: 401 });
    }

    const body = (await request.json()) as unknown;
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(fail("userId required"), { status: 400 });
    }

    const { userId } = parsed.data;

    // Verify the authenticated user owns this userId to prevent cross-user deletion.
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(fail("user not found"), { status: 404 });
    }

    if (user.id !== userId) {
      return NextResponse.json(fail("forbidden"), { status: 403 });
    }

    console.log("[Cognee] forget() requested", { userId });

    const result = await forget(userId);

    console.log("[Cognee] forget() completed", {
      userId,
      datasetDeleted: result.datasetDeleted,
    });

    return NextResponse.json(ok(result));
  } catch (reason) {
    console.error("[Cognee] forget() failed", {
      reason: reason instanceof Error ? reason.message : String(reason),
    });
    return errorResponse(reason, "Cognee forget failed");
  }
}
