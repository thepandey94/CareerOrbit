import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth-service";
import { getSession } from "@/lib/auth/session";
import { z } from "zod";

const cancelDeletionSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = cancelDeletionSchema.parse(body);

    // Verify credentials first
    const loginResult = await AuthService.login(identifier, password);
    if (!loginResult.isPendingDeletion) {
      return NextResponse.json({ error: "This account is not pending deletion." }, { status: 400 });
    }

    // Cancel deletion
    await AuthService.cancelAccountDeletion(loginResult.user.id);

    // Establish active session
    const session = await getSession();
    session.user = {
      id: loginResult.user.id,
      email: loginResult.user.email,
      userId: loginResult.user.userId,
      fullName: loginResult.user.fullName || "Student",
      role: loginResult.user.role || "STUDENT",
      accountStatus: "ACTIVE",
    };
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      message: "Account deletion cancelled. Full access restored.",
      user: session.user,
    }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to cancel account deletion.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
