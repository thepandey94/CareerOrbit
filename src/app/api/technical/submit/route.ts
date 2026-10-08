import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { submitTechnicalAttempt } from "@/lib/services/technical-service";
import { z } from "zod";

const answerItemSchema = z.object({
  questionId: z.string().min(1),
  selectedOptionId: z.string().optional(),
  submittedCode: z.string().optional(),
  language: z.enum(["python", "java"]).optional(),
});

const submitSchema = z.object({
  attemptId: z.string().uuid(),
  answers: z.array(answerItemSchema),
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

    const result = await submitTechnicalAttempt(
      session.user.id,
      parsed.data.attemptId,
      parsed.data.answers
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Technical round submission error:", error);
    const msg = error instanceof Error ? error.message : "Technical round submission failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
