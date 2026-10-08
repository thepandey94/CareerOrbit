import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSubmissionResult } from "@/lib/services/communication-service";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ submissionId: string }> }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { submissionId } = await props.params;
    if (!submissionId) {
      return NextResponse.json({ error: "Missing submission ID" }, { status: 400 });
    }

    const result = await getSubmissionResult(session.user.id, submissionId);
    if (!result) {
      return NextResponse.json({ error: "Submission result not found." }, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Communication result fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch communication scorecard." },
      { status: 500 }
    );
  }
}
