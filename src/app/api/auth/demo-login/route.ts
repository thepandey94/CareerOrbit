import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { AuthService } from "@/lib/services/auth-service";
import { handleApiError } from "@/lib/errors";
import { env } from "@/lib/env";
import { z } from "zod";

const demoLoginSchema = z.object({
  role: z.enum(["student", "admin"]).default("student"),
});

export async function POST(req: NextRequest) {
  try {
    if (!env.DEMO_MODE) {
      return NextResponse.json(
        { error: "Demo login is disabled in production environment." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { role } = demoLoginSchema.parse(body);

    const user = await AuthService.demoLogin(role);

    // Set iron-session cookie
    const session = await getSession();
    session.user = {
      id: user.id,
      email: user.email,
      userId: user.userId,
      fullName: user.fullName,
      role: user.role,
      accountStatus: user.accountStatus,
    };
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json(
      {
        success: true,
        user: session.user,
        redirect: role === "admin" ? "/admin" : "/dashboard",
        message: `Logged in as demo ${role}.`,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    return handleApiError(err, "Failed to authenticate demo session.");
  }
}
