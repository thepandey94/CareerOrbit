import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { createOrUpdateStudentRoadmap } from "@/lib/services/roadmap-service";

const completeOnboardingSchema = z.object({
  selectedTrack: z.enum(["SOFTWARE_ENGINEER", "WEB_DEVELOPER", "DATA_ANALYST"]),
  targetWeeks: z.number().min(4).max(52).default(12),
  targetDate: z.string().nullable().optional(),
  diagnosticScores: z.any().optional(),
  compatibilityBreakdown: z.any().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json(
        { error: "Authentication required to complete onboarding" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = completeOnboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid onboarding payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await createOrUpdateStudentRoadmap({
      userId: session.user.id,
      track: parsed.data.selectedTrack,
      targetWeeks: parsed.data.targetWeeks,
      targetDate: parsed.data.targetDate,
      diagnosticScores: parsed.data.diagnosticScores,
      compatibilityBreakdown: parsed.data.compatibilityBreakdown,
    });

    return NextResponse.json({
      success: true,
      message: "Career onboarding completed and personalized roadmap generated successfully.",
      track: parsed.data.selectedTrack,
      roadmapId: result.roadmap.id,
      redirectUrl: "/roadmap",
    });
  } catch (error) {
    console.error("Complete onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding and generate roadmap." },
      { status: 500 }
    );
  }
}
