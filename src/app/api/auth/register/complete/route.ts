import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth-service";
import { getSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/errors";
import { z } from "zod";

const completeRegistrationSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address."),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
  course: z.string().trim().min(2, "Course must be specified."),
  branch: z.string().trim().min(2, "Branch must be specified."),
  semester: z.number().int().min(1, "Semester must be between 1 and 12.").max(12, "Semester must be between 1 and 12."),
  userId: z.string().trim().min(3, "User ID must be 3-20 characters long.").max(20, "User ID must be 3-20 characters long."),
  password: z.string().min(12, "Password must be at least 12 characters."),
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
    return handleApiError(err, "Failed to complete registration.");
  }
}

