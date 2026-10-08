import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import {
  getDailyAssessmentQuestions,
  submitDailyAssessment,
} from "@/lib/services/assessment-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { taskId } = await params;
    const assessmentData = await getDailyAssessmentQuestions(session.user.id, taskId);

    return NextResponse.json(assessmentData);
  } catch (error: any) {
    console.error("Fetch daily assessment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve assessment." },
      { status: 400 }
    );
  }
}

const submissionSchema = z.object({
  submissions: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionId: z.string(),
    })
  ),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { taskId } = await params;
    const body = await req.json();
    const parsed = submissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await submitDailyAssessment(
      session.user.id,
      taskId,
      parsed.data.submissions
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Submit daily assessment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit assessment." },
      { status: 400 }
    );
  }
}
