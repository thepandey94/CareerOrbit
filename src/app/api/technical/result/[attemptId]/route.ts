import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getTechnicalAttemptResult } from "@/lib/services/technical-service";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { attemptId } = await context.params;
    const result = await getTechnicalAttemptResult(session.user.id, attemptId);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Technical result fetch error:", error);
    const msg = error instanceof Error ? error.message : "Failed to retrieve technical result.";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}
