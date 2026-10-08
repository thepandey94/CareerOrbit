import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getTechnicalOverview } from "@/lib/services/technical-service";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    try {
      const overview = await getTechnicalOverview(session.user.id);
      return NextResponse.json(overview, { status: 200 });
    } catch (dbErr) {
      if (env.DEMO_MODE) {
        return NextResponse.json({
          track: "SOFTWARE_ENGINEER",
          totalAttempts: 1,
          passedAttempts: 1,
          bestScore: 22,
          latestAttempt: {
            id: "demo-attempt-1",
            level: 1,
            score: 22,
            totalQuestions: 25,
            passed: true,
            status: "SUBMITTED",
          },
          level1Passed: true,
          level2Unlocked: true,
          isDemoMode: true,
        }, { status: 200 });
      }
      throw dbErr;
    }
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Technical overview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch technical round overview." },
      { status: 500 }
    );
  }
}
