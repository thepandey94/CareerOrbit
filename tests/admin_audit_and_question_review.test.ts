import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminService } from "../src/lib/services/admin-service";
import prisma from "../src/lib/db";
import { VerificationStatus, Role, CareerTrack } from "@prisma/client";

// Mock prisma client
vi.mock("../src/lib/db", () => {
  return {
    default: {
      question: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
    },
  };
});

describe("Admin Verification & Audit Trail: Question Review", () => {
  const adminId = "admin-uuid-123";
  const questionId = "question-uuid-456";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should enforce admin authorization before processing privileged operations", () => {
    // Non-admin role throws 403
    expect(() => {
      AdminService.requireAdmin("STUDENT");
    }).toThrowError(/Access denied/);

    // Admin role passes without throwing
    expect(() => {
      AdminService.requireAdmin("ADMIN");
    }).not.toThrow();
  });

  it("should approve a pending question and persist audit trail", async () => {
    const existingQuestion = {
      id: questionId,
      prompt: "What is an event loop in JavaScript?",
      topic: "JavaScript Runtime",
      track: CareerTrack.WEB_DEVELOPER,
      verificationStatus: VerificationStatus.PENDING,
    };

    (prisma.question.findUnique as any).mockResolvedValue(existingQuestion);
    (prisma.question.update as any).mockResolvedValue({
      ...existingQuestion,
      verificationStatus: VerificationStatus.APPROVED,
    });
    (prisma.auditLog.create as any).mockResolvedValue({ id: "audit-1" });

    const result = await AdminService.reviewQuestion({
      adminUserId: adminId,
      questionId,
      decision: VerificationStatus.APPROVED,
      notes: "Verified accurate and meets difficulty standards.",
    });

    expect(prisma.question.findUnique).toHaveBeenCalledWith({
      where: { id: questionId },
    });

    expect(prisma.question.update).toHaveBeenCalledWith({
      where: { id: questionId },
      data: { verificationStatus: VerificationStatus.APPROVED },
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: adminId,
        eventType: "QUESTION_VERIFICATION_REVIEW",
        metadata: {
          questionId,
          previousStatus: VerificationStatus.PENDING,
          newStatus: VerificationStatus.APPROVED,
          topic: "JavaScript Runtime",
          track: CareerTrack.WEB_DEVELOPER,
          notes: "Verified accurate and meets difficulty standards.",
        },
      },
    });

    expect(result.verificationStatus).toBe(VerificationStatus.APPROVED);
  });

  it("should reject a question and log the rejection with audit details", async () => {
    const existingQuestion = {
      id: questionId,
      prompt: "Hallucinated or incorrect code question",
      topic: "Python",
      track: CareerTrack.DATA_ANALYST,
      verificationStatus: VerificationStatus.PENDING,
    };

    (prisma.question.findUnique as any).mockResolvedValue(existingQuestion);
    (prisma.question.update as any).mockResolvedValue({
      ...existingQuestion,
      verificationStatus: VerificationStatus.REJECTED,
    });
    (prisma.auditLog.create as any).mockResolvedValue({ id: "audit-2" });

    const result = await AdminService.reviewQuestion({
      adminUserId: adminId,
      questionId,
      decision: VerificationStatus.REJECTED,
      notes: "Incorrect syntax in option B.",
    });

    expect(prisma.question.update).toHaveBeenCalledWith({
      where: { id: questionId },
      data: { verificationStatus: VerificationStatus.REJECTED },
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: adminId,
        eventType: "QUESTION_VERIFICATION_REVIEW",
        metadata: {
          questionId,
          previousStatus: VerificationStatus.PENDING,
          newStatus: VerificationStatus.REJECTED,
          topic: "Python",
          track: CareerTrack.DATA_ANALYST,
          notes: "Incorrect syntax in option B.",
        },
      },
    });

    expect(result.verificationStatus).toBe(VerificationStatus.REJECTED);
  });

  it("should throw an error and abort audit logging when question is not found", async () => {
    (prisma.question.findUnique as any).mockResolvedValue(null);

    await expect(
      AdminService.reviewQuestion({
        adminUserId: adminId,
        questionId: "nonexistent-id",
        decision: VerificationStatus.APPROVED,
      })
    ).rejects.toThrowError("Question not found.");

    expect(prisma.question.update).not.toHaveBeenCalled();
    expect(prisma.auditLog.create).not.toHaveBeenCalled();
  });
});
