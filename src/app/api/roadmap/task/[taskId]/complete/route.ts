import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { completeStudentTask } from "@/lib/services/roadmap-service";

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
    const result = await completeStudentTask(session.user.id, taskId);

    return NextResponse.json({
      success: true,
      message: "Task completed successfully.",
      completedTask: result.completedTask,
      newlyUnlockedTaskIds: result.newlyUnlockedTaskIds,
    });
  } catch (error: any) {
    console.error("Complete task error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete task." },
      { status: 400 }
    );
  }
}
