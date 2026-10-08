import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth-service";
import { handleApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ available: false, error: "userId parameter is required." }, { status: 400 });
    }

    const result = await AuthService.checkUserIdAvailability(userId);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    return handleApiError(err, "Failed to verify User ID availability.");
  }
}

