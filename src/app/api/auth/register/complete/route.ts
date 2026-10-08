import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth-service";
import { getSession } from "@/lib/auth/session";
import { z } from "zod";

const completeRegistrationSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  course: z.string().min(2, "Course must be specified."),
  branch: z.string().min(2, "Branch must be specified."),
  semester: z.number().int().min(1).max(12),
  userId: z.string().min(3).max(20),
  password: z.string().min(12, "Password must be at least 12 characters."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = completeRegistrationSchema.parse(body);

    const user = await AuthService.completeRegistration(data);

    // Create session cookie
    const session = await getSession();
    session.user = {
      id: user.id,
      email: user.email,
      userId: user.userId,
      fullName: user.fullName,
      role: user.role,
      accountStatus: user.accountStatus,
    };
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to complete registration.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
