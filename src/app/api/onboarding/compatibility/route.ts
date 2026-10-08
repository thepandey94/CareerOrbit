import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateCareerCompatibility } from "@/lib/onboarding/scoring";

const compatibilitySchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      optionId: z.string(),
    })
  ),
  skillRatings: z.record(z.string(), z.number().min(1).max(5)),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = compatibilitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid questionnaire format", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = calculateCareerCompatibility(parsed.data.answers, parsed.data.skillRatings);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Compatibility scoring error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while scoring compatibility." },
      { status: 500 }
    );
  }
}
