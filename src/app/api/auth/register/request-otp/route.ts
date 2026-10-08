import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth-service";
import { z } from "zod";

const requestOtpSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = requestOtpSchema.parse(body);

    const result = await AuthService.requestRegistrationOtp(email);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send verification code.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
