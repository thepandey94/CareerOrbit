import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAptitudeOverview } from "@/lib/services/aptitude-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const data = await getAptitudeOverview(session.user.id);
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Aptitude overview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch aptitude overview." },
      { status: 500 }
    );
  }
}
