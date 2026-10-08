import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth-service";
import { handleApiError } from "@/lib/errors";
import { z } from "zod";

const requestOtpSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request payload. Please provide a valid email address." },
        { status: 400 }
      );
    }

    const { email } = requestOtpSchema.parse(body);

    const result = await AuthService.requestRegistrationOtp(email);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    return handleApiError(err, "Failed to send verification code.");
  }
}

