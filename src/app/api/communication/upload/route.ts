import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { processAndEvaluateSubmission } from "@/lib/services/communication-service";

const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB max upload

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    let submissionId = "";
    let durationSeconds = 0;
    let transcript = "";
    let hasVideoFeed = true;
    let videoBuffer: Buffer | undefined;
    let mimeType = "video/webm";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      submissionId = (formData.get("submissionId") as string) || "";
      durationSeconds = parseInt((formData.get("durationSeconds") as string) || "0", 10);
      transcript = (formData.get("transcript") as string) || "";
      hasVideoFeed = (formData.get("hasVideoFeed") as string) !== "false";

      const videoFile = formData.get("video") as File | null;
      if (videoFile && typeof videoFile.arrayBuffer === "function") {
        if (videoFile.size > MAX_VIDEO_BYTES) {
          return NextResponse.json(
            { error: "Recording exceeds the 50MB maximum upload limit." },
            { status: 413 }
          );
        }
        mimeType = videoFile.type || "video/webm";
        const arrayBuf = await videoFile.arrayBuffer();
        videoBuffer = Buffer.from(arrayBuf);
      }
    } else {
      // JSON payload
      const body = await req.json().catch(() => ({}));
      submissionId = body.submissionId || "";
      durationSeconds = typeof body.durationSeconds === "number" ? body.durationSeconds : parseInt(body.durationSeconds || "0", 10);
      transcript = body.transcript || "";
      hasVideoFeed = body.hasVideoFeed !== false;
    }

    if (!submissionId) {
      return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
    }

    if (durationSeconds < 30) {
      return NextResponse.json(
        { error: "Presentation must be at least 30 seconds to be evaluated reliably." },
        { status: 400 }
      );
    }

    if (durationSeconds > 450) {
      return NextResponse.json(
        { error: "Presentation exceeded the 7-minute limit (with 30s grace window)." },
        { status: 400 }
      );
    }

    const result = await processAndEvaluateSubmission({
      userId: session.user.id,
      submissionId,
      durationSeconds,
      transcript,
      hasVideoFeed,
      videoBuffer,
      mimeType,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Communication upload & evaluate error:", error);
    const message = error instanceof Error ? error.message : "Failed to process presentation.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
