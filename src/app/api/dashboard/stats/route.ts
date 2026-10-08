import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { DashboardService } from "@/lib/services/dashboard-service";
import { env } from "@/lib/env";
import { demoStore } from "@/lib/demo/demo-store";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    try {
      const dashboard = await DashboardService.getStudentDashboard(session.user.id);
      return NextResponse.json(dashboard, { status: 200 });
    } catch (serviceErr) {
      if (env.DEMO_MODE) {
        console.warn("[DashboardAPI] Using fallback demo data store for dashboard statistics.");
        const fallback = demoStore.getDashboardData(session.user.id);
        return NextResponse.json(fallback, { status: 200 });
      }
      throw serviceErr;
    }
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data." },
      { status: 500 }
    );
  }
}
