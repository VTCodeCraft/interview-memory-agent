import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { getReport } from "@/services/report.service";
import { fail, ok } from "@/lib/utils/api";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json(fail("unauthorized"), { status: 401 });
  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  const { id } = await context.params;
  const report = user ? await getReport(id) : null;
  // Only the owner may read a report; missing and foreign reports look the same.
  if (!report || !user || report.userId !== user.id) {
    return NextResponse.json(fail("report not found"), { status: 404 });
  }
  return NextResponse.json(ok(report));
}
