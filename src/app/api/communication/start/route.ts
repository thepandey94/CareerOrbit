import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { startCommunicationSubmission } from "@/lib/services/communication-service";

const startSchema = z.object({
  topicId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parse = startSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const result = await startCommunicationSubmission(session.user.id, parse.data.topicId);

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Communication start error:", error);
    return NextResponse.json(
      { error: "Failed to initialize presentation session." },
      { status: 500 }
    );
  }
}
