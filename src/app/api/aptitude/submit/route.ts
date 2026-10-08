import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { submitAptitudeAttempt } from "@/lib/services/aptitude-service";
import { z } from "zod";

const aptitudeAnswerItem = z.object({
  questionId: z.string().min(1),
  selectedOptionId: z.string().optional(),
});

const submitSchema = z.object({
  attemptId: z.string().uuid(),
  answers: z.array(aptitudeAnswerItem),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = submitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await submitAptitudeAttempt(
      session.user.id,
      parsed.data.attemptId,
      parsed.data.answers
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Aptitude submission error:", error);
    const msg = error instanceof Error ? error.message : "Aptitude submission failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
