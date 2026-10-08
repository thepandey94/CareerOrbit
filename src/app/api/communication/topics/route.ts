import { NextRequest, NextResponse } from "next/server";
import { COMMUNICATION_TOPICS } from "@/lib/communication/topics";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    const topics = domain
      ? COMMUNICATION_TOPICS.filter((t) => t.domain === domain || t.domain === "GENERAL_ENGINEERING")
      : COMMUNICATION_TOPICS;

    return NextResponse.json({ topics }, { status: 200 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Communication topics error:", error);
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}
