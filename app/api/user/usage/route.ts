import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { LIMITS } from "@/lib/config/limits";
import { getCurrentMonthInterviewCount } from "@/services/usage.service";
import { unauthorized } from "@/lib/utils/api";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return unauthorized();
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const used = await getCurrentMonthInterviewCount(user.id);
    const limit = LIMITS.MAX_INTERVIEWS_PER_MONTH;
    const remaining = Math.max(0, limit - used);

    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    return NextResponse.json({
      used,
      remaining,
      limit,
      month: monthStr,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
