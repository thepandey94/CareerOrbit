import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { startTechnicalAttempt } from "@/lib/services/technical-service";
import { z } from "zod";

const startSchema = z.object({
  level: z.number().int().min(1).max(3).default(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = startSchema.safeParse(body);
    const level = parsed.success ? parsed.data.level : 1;

    const data = await startTechnicalAttempt(session.user.id, level);
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Start technical round error:", error);
    return NextResponse.json(
      { error: "Failed to initialize technical round attempt." },
      { status: 500 }
    );
  }
}
