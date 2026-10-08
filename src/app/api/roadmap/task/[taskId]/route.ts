import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getTaskWithLearningDetails } from "@/lib/services/roadmap-service";

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
    const taskDetails = await getTaskWithLearningDetails(session.user.id, taskId);

    if (!taskDetails) {
      return NextResponse.json(
        { error: "Task not found or access denied." },
        { status: 404 }
      );
    }

    return NextResponse.json(taskDetails);
  } catch (error) {
    console.error("Fetch task details error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve task details." },
      { status: 500 }
    );
  }
}
