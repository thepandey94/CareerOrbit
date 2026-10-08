import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getStudentRoadmap } from "@/lib/services/roadmap-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const data = await getStudentRoadmap(session.user.id);

    if (!data) {
      return NextResponse.json(
        {
          hasRoadmap: false,
          message: "No active career roadmap found. Please complete career onboarding.",
          redirectUrl: "/onboarding",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      hasRoadmap: true,
      profile: data.profile,
      roadmap: data.roadmap,
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("Fetch roadmap error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve student roadmap." },
      { status: 500 }
    );
  }
}
