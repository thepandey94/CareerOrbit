import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAptitudeOverview } from "@/lib/services/aptitude-service";

import { env } from "@/lib/env";
import { demoStore } from "@/lib/demo/demo-store";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    try {
      const data = await getAptitudeOverview(session.user.id);
      return NextResponse.json(data, { status: 200 });
    } catch (dbErr) {
      if (env.DEMO_MODE) {
        return NextResponse.json(demoStore.getAptitudeOverview(), { status: 200 });
      }
      throw dbErr;
    }
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Aptitude overview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch aptitude overview." },
      { status: 500 }
    );
  }
}
