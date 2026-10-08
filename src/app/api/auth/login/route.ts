import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth-service";
import { getSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/errors";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Email or User ID is required."),
  password: z.string().min(1, "Password is required."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { identifier, password } = loginSchema.parse(body);

    const result = await AuthService.login(identifier, password);

    // If account is pending deletion, do NOT establish full access session.
    // Instead return pending deletion status so client redirects to the recovery screen.
    if (result.isPendingDeletion) {
      return NextResponse.json({
        isPendingDeletion: true,
        user: result.user,
        message: "This account is scheduled for deletion.",
      }, { status: 200 });
    }

    const session = await getSession();
    session.user = {
      id: result.user.id,
      email: result.user.email,
      userId: result.user.userId,
      fullName: result.user.fullName!,
      role: result.user.role!,
      accountStatus: result.user.accountStatus!,
    };
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      user: session.user,
    }, { status: 200 });
  } catch (err: unknown) {
    return handleApiError(err, "Invalid credentials.");
  }
}

