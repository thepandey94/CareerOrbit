import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth-service";
import { z } from "zod";

const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Verification code must be 6 digits."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = verifyOtpSchema.parse(body);

    const result = await AuthService.verifyRegistrationOtp(email, code);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to verify code.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
