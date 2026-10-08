import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getTechnicalOverview } from "@/lib/services/technical-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const overview = await getTechnicalOverview(session.user.id);
    return NextResponse.json(overview, { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Technical overview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch technical round overview." },
      { status: 500 }
    );
  }
}
