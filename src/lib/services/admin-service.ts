import prisma from "../db";
import { hashPassword, validatePasswordStrength } from "../auth/password";
import { Role, AccountStatus, VerificationStatus, CareerTrack, AssessmentType } from "@prisma/client";
import { env } from "../env";

export interface SetupInitialAdminParams {
  setupSecret: string;
  email: string;
  userId: string;
  fullName: string;
  password: string;
}

export class AdminService {
  /**
   * Provisions the initial system administrator.
   * Only accessible when no administrator currently exists AND the secret matches.
   */
  static async setupInitialAdmin(params: SetupInitialAdminParams) {
    if (!params.setupSecret || params.setupSecret !== env.ADMIN_SETUP_SECRET) {
      throw new Error("Invalid administrator setup secret.");
    }

    // Check if an admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: Role.ADMIN },
    });

    if (existingAdmin) {
      throw new Error("An administrator account already exists. Self-provisioning is closed.");
    }

    const passwordValidation = validatePasswordStrength(params.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error);
    }

    const passwordHash = await hashPassword(params.password);

    const admin = await prisma.user.create({
      data: {
        email: params.email.trim().toLowerCase(),
        userId: params.userId.trim().toLowerCase(),
        fullName: params.fullName.trim(),
        course: "Administration",
        branch: "Operations",
        semester: 1,
        passwordHash,
        role: Role.ADMIN,
        accountStatus: AccountStatus.ACTIVE,
      },
    });

    return {
      id: admin.id,
      email: admin.email,
      userId: admin.userId,
      role: admin.role,
    };
  }

  /**
   * Asserts administrator role on the server.
   */
  static requireAdmin(role?: string) {
    if (role !== Role.ADMIN) {
      const error = new Error("Access denied. Administrator privileges required.");
      (error as unknown as { statusCode: number }).statusCode = 403;
      throw error;
    }
  }

  /**
   * Retrieves high-level administrative platform metrics.
   */
  static async getSystemStats() {
    const [totalUsers, activeUsers, pendingDeletion, totalAdmins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { accountStatus: AccountStatus.ACTIVE } }),
      prisma.user.count({ where: { accountStatus: AccountStatus.PENDING_DELETION } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      pendingDeletion,
      totalAdmins,
      databaseReady: true,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Retrieves comprehensive metrics including assessments, tracks, and roadmaps.
   */
  static async getComprehensiveMetrics() {
    const [
      totalUsers,
      activeUsers,
      pendingDeletion,
      totalAdmins,
      trackCounts,
      techStats,
      aptStats,
      commStats,
      roadmapCount,
      pendingQuestionsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { accountStatus: AccountStatus.ACTIVE } }),
      prisma.user.count({ where: { accountStatus: AccountStatus.PENDING_DELETION } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.careerProfile.groupBy({
        by: ["selectedTrack"],
        _count: { selectedTrack: true },
      }),
      prisma.assessmentAttempt.aggregate({
        where: { assessmentType: AssessmentType.TECHNICAL },
        _count: { id: true },
        _avg: { score: true },
      }),
      prisma.assessmentAttempt.aggregate({
        where: { assessmentType: AssessmentType.APTITUDE },
        _count: { id: true },
        _avg: { score: true },
      }),
      prisma.communicationSubmission.aggregate({
        _count: { id: true },
        _avg: { overallScore: true },
      }),
      prisma.roadmap.count({ where: { isCompleted: true } }),
      prisma.question.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
    ]);

    const passedTech = await prisma.assessmentAttempt.count({
      where: { assessmentType: AssessmentType.TECHNICAL, passed: true },
    });
    const passedApt = await prisma.assessmentAttempt.count({
      where: { assessmentType: AssessmentType.APTITUDE, passed: true },
    });
    const passedComm = await prisma.communicationSubmission.count({
      where: { passed: true },
    });

    const techPassRate = techStats._count.id > 0 ? Math.round((passedTech / techStats._count.id) * 100) : 0;
    const aptPassRate = aptStats._count.id > 0 ? Math.round((passedApt / aptStats._count.id) * 100) : 0;
    const commPassRate = commStats._count.id > 0 ? Math.round((passedComm / commStats._count.id) * 100) : 0;

    return {
      users: {
        totalUsers,
        activeUsers,
        pendingDeletion,
        totalAdmins,
      },
      tracks: {
        distribution: trackCounts.map((t) => ({
          track: t.selectedTrack,
          count: t._count.selectedTrack,
        })),
        completedRoadmaps: roadmapCount,
      },
      assessments: {
        technical: {
          totalAttempts: techStats._count.id,
          passRatePercent: techPassRate,
          averageScore: Math.round(techStats._avg.score || 0),
        },
        aptitude: {
          totalAttempts: aptStats._count.id,
          passRatePercent: aptPassRate,
          averageScore: Math.round(aptStats._avg.score || 0),
        },
        communication: {
          totalSubmissions: commStats._count.id,
          passRatePercent: commPassRate,
          averageScore: Math.round(commStats._avg.overallScore || 0),
        },
      },
      pendingReviews: {
        questionsToReview: pendingQuestionsCount,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Fetches questions for administrator review and verification.
   */
  static async getQuestionsForReview(status?: VerificationStatus) {
    return prisma.question.findMany({
      where: status ? { verificationStatus: status } : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  /**
   * Reviews and approves or rejects a question with audit logging.
   */
  static async reviewQuestion(params: {
    adminUserId: string;
    questionId: string;
    decision: VerificationStatus;
    notes?: string;
  }) {
    const { adminUserId, questionId, decision, notes } = params;

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new Error("Question not found.");
    }

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: { verificationStatus: decision },
    });

    // Record audit log entry
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        eventType: "QUESTION_VERIFICATION_REVIEW",
        metadata: {
          questionId,
          previousStatus: question.verificationStatus,
          newStatus: decision,
          topic: question.topic,
          track: question.track,
          notes: notes || null,
        },
      },
    });

    return updated;
  }

  /**
   * Retrieves audit logs for security and compliance review.
   */
  static async getAuditLogs(limit: number = 25) {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            fullName: true,
            role: true,
          },
        },
      },
    });
  }
}
