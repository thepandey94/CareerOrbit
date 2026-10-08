import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { UserService } from "@/lib/services/user-service";
import { z } from "zod";

const updateProfileSchema = z.object({
  fullName: z.string().min(2),
  course: z.string().min(2),
  branch: z.string().min(2),
  semester: z.number().int().min(1).max(12),
});

import { env } from "@/lib/env";
import { demoStore } from "@/lib/demo/demo-store";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    try {
      const profile = await UserService.getProfile(session.user.id);
      return NextResponse.json({ user: profile }, { status: 200 });
    } catch (err: unknown) {
      if (env.DEMO_MODE) {
        const demoUser = demoStore.findUserByIdentifier(session.user.id) || demoStore.findUserByIdentifier(session.user.userId) || {
          id: session.user.id,
          email: session.user.email,
          userId: session.user.userId,
          fullName: session.user.fullName,
          course: "B.Tech",
          branch: "Computer Science",
          semester: 6,
          role: session.user.role,
          avatarUrl: null,
          accountStatus: "ACTIVE",
          createdAt: new Date().toISOString(),
        };
        return NextResponse.json({ user: demoUser }, { status: 200 });
      }
      throw err;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const data = updateProfileSchema.parse(body);

    const updated = await UserService.updateProfile(session.user.id, data);
    session.user.fullName = updated.fullName;
    await session.save();

    return NextResponse.json({ success: true, user: updated }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update profile.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
