import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { AdminService } from "@/lib/services/admin-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    AdminService.requireAdmin(session.user.role);

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const logs = await AdminService.getAuditLogs(limit);
    return NextResponse.json({ logs }, { status: 200 });
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || "Failed to load audit logs." }, { status });
  }
}
