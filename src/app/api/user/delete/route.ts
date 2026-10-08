import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { AuthService } from "@/lib/services/auth-service";
import { z } from "zod";

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to confirm deletion."),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { password } = deleteAccountSchema.parse(body);

    const result = await AuthService.requestAccountDeletion(session.user.id, password);

    // Destroy active session immediately so user cannot access active dashboard
    session.destroy();

    return NextResponse.json({
      success: true,
      message: `Account scheduled for deletion. You have a ${result.gracePeriodDays}-day grace period to cancel.`,
      deletionRequestedAt: result.deletionRequestedAt,
    }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process deletion request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
