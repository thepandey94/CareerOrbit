import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { AdminService } from "@/lib/services/admin-service";
import { VerificationStatus } from "@prisma/client";

const reviewSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ questionId: string }> }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    AdminService.requireAdmin(session.user.role);

    const { questionId } = await props.params;
    if (!questionId) {
      return NextResponse.json({ error: "Missing questionId parameter" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const parse = reviewSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: "Invalid review decision payload." }, { status: 400 });
    }

    const updated = await AdminService.reviewQuestion({
      adminUserId: session.user.id,
      questionId,
      decision: parse.data.decision as VerificationStatus,
      notes: parse.data.notes,
    });

    return NextResponse.json({ question: updated }, { status: 200 });
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || "Failed to submit review." }, { status });
  }
}
