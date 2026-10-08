import { NextRequest, NextResponse } from "next/server";
import { AdminService } from "@/lib/services/admin-service";
import { z } from "zod";

const setupAdminSchema = z.object({
  setupSecret: z.string().min(1, "Setup secret is required."),
  email: z.string().email(),
  userId: z.string().min(3).max(20),
  fullName: z.string().min(2),
  password: z.string().min(12),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = setupAdminSchema.parse(body);

    const admin = await AdminService.setupInitialAdmin(data);

    return NextResponse.json({
      success: true,
      message: "Initial administrator account successfully provisioned.",
      admin,
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to provision administrator.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
