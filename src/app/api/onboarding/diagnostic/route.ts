import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DIAGNOSTIC_QUESTIONS, evaluateDiagnosticAssessment } from "@/lib/onboarding/diagnostic";

export async function GET() {
  // Strip correct answer and explanation for security
  const sanitized = DIAGNOSTIC_QUESTIONS.map((q) => ({
    id: q.id,
    skill: q.skill,
    skillLabel: q.skillLabel,
    topic: q.topic,
    prompt: q.prompt,
    options: q.options,
  }));

  return NextResponse.json({
    questions: sanitized,
    totalQuestions: sanitized.length,
    instructions:
      "This quick diagnostic assessment evaluates your current knowledge baseline across supported languages. Results help tailor your preparation recommendations and will not block you from selecting any career path.",
  });
}

const submissionSchema = z.object({
  submissions: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionId: z.string(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = submissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid diagnostic submission payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = evaluateDiagnosticAssessment(parsed.data.submissions);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Diagnostic evaluation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while evaluating diagnostic assessment." },
      { status: 500 }
    );
  }
}
