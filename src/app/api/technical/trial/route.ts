import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { runTrialCode } from "@/lib/services/technical-service";
import { z } from "zod";

const trialSchema = z.object({
  attemptId: z.string().uuid(),
  questionId: z.string().min(1),
  code: z.string().max(64 * 1024, "Code length exceeds 64KB limit"),
  language: z.enum(["python", "java"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = trialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid trial request", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await runTrialCode(
      session.user.id,
      parsed.data.attemptId,
      parsed.data.questionId,
      parsed.data.code,
      parsed.data.language
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    const msg = error instanceof Error ? error.message : "Code trial run failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
