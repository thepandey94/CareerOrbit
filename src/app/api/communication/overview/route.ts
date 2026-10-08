import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { COMMUNICATION_TOPICS } from "@/lib/communication/topics";
import { getUserCommunicationHistory } from "@/lib/services/communication-service";
import { env } from "@/lib/env";
import { demoStore } from "@/lib/demo/demo-store";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let history: { submissions: any[]; stats: any };
    try {
      history = await getUserCommunicationHistory(session.user.id);
    } catch (dbErr) {
      if (env.DEMO_MODE) {
        history = demoStore.getCommunicationHistory();
      } else {
        throw dbErr;
      }
    }

    return NextResponse.json(
      {
        topics: COMMUNICATION_TOPICS,
        history: history.submissions,
        stats: history.stats,
        rules: {
          prepDurationSeconds: 300,
          maxPresentationDurationSeconds: 420,
          minPresentationDurationSeconds: 60,
          passingThreshold: 60,
          categoriesCount: 5,
          ephemeralRetentionNotice:
            "Recordings are processed ephemerally for scoring and purged immediately. Only structured feedback and metrics are retained.",
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Communication overview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch communication overview." },
      { status: 500 }
    );
  }
}
