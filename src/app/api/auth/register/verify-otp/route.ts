import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth-service";
import { handleApiError } from "@/lib/errors";
import { z } from "zod";

const verifyOtpSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address."),
  code: z.string().trim().length(6, "Verification code must be 6 digits."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { email, code } = verifyOtpSchema.parse(body);

    const result = await AuthService.verifyRegistrationOtp(email, code);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    return handleApiError(err, "Failed to verify code.");
  }
}

