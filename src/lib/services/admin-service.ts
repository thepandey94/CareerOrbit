import prisma from "../db";
import { hashPassword, validatePasswordStrength } from "../auth/password";
import { Role, AccountStatus } from "@prisma/client";
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
}
