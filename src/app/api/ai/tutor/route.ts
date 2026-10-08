import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { askStudyTutor } from "@/lib/ai/tutor";

const tutorRequestSchema = z.object({
  studentQuestion: z.string().min(1, "Question cannot be empty").max(1500),
  track: z.enum(["SOFTWARE_ENGINEER", "WEB_DEVELOPER", "DATA_ANALYST"]).optional(),
  topic: z.string().optional(),
  inAppContentContext: z.string().optional(),
  isActiveAssessment: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json(
        { error: "Authentication required to consult the AI Study Tutor" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = tutorRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid tutor request", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await askStudyTutor({
      studentQuestion: parsed.data.studentQuestion,
      track: parsed.data.track,
      topic: parsed.data.topic,
      inAppContentContext: parsed.data.inAppContentContext,
      isActiveAssessment: parsed.data.isActiveAssessment,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Tutor route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while communicating with the study tutor." },
      { status: 500 }
    );
  }
}
