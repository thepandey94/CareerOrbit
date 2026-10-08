import { NextResponse } from "next/server";
import { CAREER_TRACKS, CAREER_QUESTIONNAIRE, SUPPORTED_SKILLS } from "@/lib/onboarding/tracks";

export async function GET() {
  return NextResponse.json({
    tracks: Object.values(CAREER_TRACKS),
    questionnaire: CAREER_QUESTIONNAIRE,
    supportedSkills: SUPPORTED_SKILLS,
  });
}
