import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { executeCode } from "@/lib/execution/engine";
import { z } from "zod";

const playgroundSchema = z.object({
  language: z.enum(["python", "java"]),
  code: z.string().min(1, "Code cannot be empty").max(64 * 1024, "Code exceeds 64KB limit"),
  stdin: z.string().max(10 * 1024, "Input exceeds 10KB limit").optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = playgroundSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid playground execution payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await executeCode({
      language: parsed.data.language,
      code: parsed.data.code,
      stdin: parsed.data.stdin,
      timeoutMs: 5000,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Playground execution error:", error);
    const msg = error instanceof Error ? error.message : "Code execution failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
