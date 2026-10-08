import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { AdminService } from "@/lib/services/admin-service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // Strict server-side RBAC enforcement
    AdminService.requireAdmin(session.user.role);

    const stats = await AdminService.getSystemStats();
    return NextResponse.json({ success: true, stats }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Access denied.";
    const status = (err as unknown as { statusCode?: number }).statusCode || 403;
    return NextResponse.json({ error: message }, { status });
  }
}
