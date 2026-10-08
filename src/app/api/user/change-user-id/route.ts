import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { AuthService } from "@/lib/services/auth-service";
import { z } from "zod";

const changeUserIdSchema = z.object({
  newUserId: z.string().min(3).max(20),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { newUserId } = changeUserIdSchema.parse(body);

    const result = await AuthService.changeUserId(session.user.id, newUserId);
    session.user.userId = result.userId;
    await session.save();

    return NextResponse.json({
      success: true,
      message: "User ID successfully updated.",
      userId: result.userId,
      userIdChangedAt: result.userIdChangedAt,
    }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to change User ID.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
