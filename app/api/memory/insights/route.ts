import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/utils/api";

/**
 * GET /api/memory/insights
 *
 * Placeholder — memory insight queries require a production Cognee dataset.
 * Use GET /api/memory/timeline or recall via the interview flow instead.
 */
export async function GET(_request: NextRequest) {
  return NextResponse.json(
    fail("Memory insight queries are not available in this environment"),
    { status: 501 },
  );
}
