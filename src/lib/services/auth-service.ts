import prisma from "../db";
import { generateOtp, verifyOtpCode, MAX_OTP_ATTEMPTS, OTP_COOLDOWN_SECONDS } from "../auth/otp";
import { hashPassword, verifyPassword, validatePasswordStrength } from "../auth/password";
import { sendOtpEmail } from "../email/service";
import { Role, AccountStatus, VerificationType } from "@prisma/client";

export const USER_ID_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
export const USER_ID_COOLDOWN_DAYS = 90;
export const ACCOUNT_DELETION_GRACE_DAYS = 14;

export interface RegistrationStep1Params {
  email: string;
}

export interface CompleteRegistrationParams {
  email: string;
  fullName: string;
  course: string;
  branch: string;
  semester: number;
  userId: string;
  password: string;
}

export class AuthService {
  /**
   * Step 1: Request an OTP to verify email during registration.
   */
  static async requestRegistrationOtp(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already belongs to an active account
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new Error("An account with this email address already exists. Please log in.");
    }

    // Cooldown check on recent OTPs
    const recentVerification = await prisma.emailVerification.findFirst({
      where: {
        email: normalizedEmail,
        type: VerificationType.REGISTRATION,
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentVerification) {
      const elapsedSeconds = (Date.now() - recentVerification.createdAt.getTime()) / 1000;
      if (elapsedSeconds < OTP_COOLDOWN_SECONDS) {
        const waitSeconds = Math.ceil(OTP_COOLDOWN_SECONDS - elapsedSeconds);
        throw new Error(`Please wait ${waitSeconds} seconds before requesting a new verification code.`);
      }
    }

    const { code, hash, expiresAt } = generateOtp();

    // Store in DB
    await prisma.emailVerification.create({
      data: {
        email: normalizedEmail,
        otpHash: hash,
        type: VerificationType.REGISTRATION,
        expiresAt,
      },
    });

    // Deliver OTP
    await sendOtpEmail({
      to: normalizedEmail,
      code,
      type: "REGISTRATION",
    });

    return {
      success: true,
      message: "Verification code sent to your email.",
    };
  }

  /**
   * Step 2: Verify the OTP sent to the email address.
   */
  static async verifyRegistrationOtp(email: string, code: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const verification = await prisma.emailVerification.findFirst({
      where: {
        email: normalizedEmail,
        type: VerificationType.REGISTRATION,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      throw new Error("No verification code found. Please request a new code.");
    }

    if (new Date() > verification.expiresAt) {
      throw new Error("Verification code has expired. Please request a new code.");
    }

    if (verification.attempts >= MAX_OTP_ATTEMPTS) {
      throw new Error("Too many failed attempts. This code is invalidated. Please request a new one.");
    }

    const isValid = verifyOtpCode(code, verification.otpHash);

    if (!isValid) {
      await prisma.emailVerification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = MAX_OTP_ATTEMPTS - (verification.attempts + 1);
      throw new Error(`Invalid code. ${remaining} attempts remaining.`);
    }

    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verifiedAt: new Date() },
    });

    return {
      success: true,
      message: "Email successfully verified.",
    };
  }

  /**
   * Checks whether a User ID is available and returns alternative suggestions if taken.
   */
  static async checkUserIdAvailability(candidate: string) {
    const trimmed = candidate.trim();
    if (!USER_ID_REGEX.test(trimmed)) {
      return {
        available: false,
        error: "User ID must be 3-20 characters long and contain only letters, numbers, and underscores.",
        suggestions: [],
      };
    }

    const existing = await prisma.user.findUnique({
      where: { userId: trimmed.toLowerCase() },
    });

    if (!existing) {
      return { available: true, suggestions: [] };
    }

    // Generate deterministic suggestions
    const year = new Date().getFullYear();
    const rawSuggestions = [
      `${trimmed}_${year}`,
      `${trimmed}_swe`,
      `${trimmed}_dev`,
      `the_${trimmed}`,
    ];

    // Filter suggestions to ensure availability
    const suggestions: string[] = [];
    for (const s of rawSuggestions) {
      if (USER_ID_REGEX.test(s)) {
        const taken = await prisma.user.findUnique({ where: { userId: s.toLowerCase() } });
        if (!taken) suggestions.push(s);
      }
    }

    return {
      available: false,
      error: "This User ID is already taken.",
      suggestions: suggestions.slice(0, 3),
    };
  }

  /**
   * Step 3: Complete registration and create user account.
   */
  static async completeRegistration(params: CompleteRegistrationParams) {
    const normalizedEmail = params.email.trim().toLowerCase();
    const normalizedUserId = params.userId.trim().toLowerCase();

    // Verify email was actually validated within the last 30 minutes
    const validVerification = await prisma.emailVerification.findFirst({
      where: {
        email: normalizedEmail,
        type: VerificationType.REGISTRATION,
        verifiedAt: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!validVerification || !validVerification.verifiedAt) {
      throw new Error("Email must be verified before completing registration.");
    }

    const elapsedVerifiedMinutes = (Date.now() - validVerification.verifiedAt.getTime()) / (1000 * 60);
    if (elapsedVerifiedMinutes > 30) {
      throw new Error("Verification session has expired. Please verify your email again.");
    }

    // Validate User ID
    const availability = await this.checkUserIdAvailability(normalizedUserId);
    if (!availability.available) {
      throw new Error(availability.error || "User ID is not available.");
    }

    // Validate Password
    const passwordValidation = validatePasswordStrength(params.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error);
    }

    const passwordHash = await hashPassword(params.password);

    // Create user and gamification profile in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          userId: normalizedUserId,
          passwordHash,
          fullName: params.fullName.trim(),
          course: params.course.trim(),
          branch: params.branch.trim(),
          semester: Number(params.semester),
          role: Role.STUDENT,
          accountStatus: AccountStatus.ACTIVE,
        },
      });

      await tx.gamificationState.create({
        data: {
          userId: user.id,
          currentStreak: 0,
          longestStreak: 0,
          streakFreezeCount: 1,
          earnedBadges: [],
          totalPoints: 0,
        },
      });

      return user;
    });

    return {
      id: newUser.id,
      email: newUser.email,
      userId: newUser.userId,
      fullName: newUser.fullName,
      role: newUser.role,
      accountStatus: newUser.accountStatus,
    };
  }

  /**
   * Dual login supporting email OR unique User ID.
   */
  static async login(identifier: string, passwordCandidate: string) {
    const trimmedId = identifier.trim().toLowerCase();

    // Query user by email OR userId
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: trimmedId },
          { userId: trimmedId },
        ],
      },
    });

    // Generic error message prevents account enumeration
    if (!user) {
      throw new Error("Invalid email/user ID or password.");
    }

    const isMatch = await verifyPassword(user.passwordHash, passwordCandidate);
    if (!isMatch) {
      throw new Error("Invalid email/user ID or password.");
    }

    // Check account deletion status
    if (user.accountStatus === AccountStatus.PENDING_DELETION) {
      return {
        isPendingDeletion: true,
        user: {
          id: user.id,
          email: user.email,
          userId: user.userId,
          deletionRequestedAt: user.deletionRequestedAt,
        },
      };
    }

    return {
      isPendingDeletion: false,
      user: {
        id: user.id,
        email: user.email,
        userId: user.userId,
        fullName: user.fullName,
        role: user.role,
        accountStatus: user.accountStatus,
      },
    };
  }

  /**
   * Enforces 90-day cooldown on User ID changes.
   */
  static async changeUserId(userId: string, candidateNewId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found.");

    const normalizedNew = candidateNewId.trim().toLowerCase();
    if (normalizedNew === user.userId) {
      throw new Error("New User ID must be different from current User ID.");
    }

    // Enforce 90-day cooldown
    if (user.userIdChangedAt) {
      const cooldownMs = USER_ID_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
      const elapsed = Date.now() - user.userIdChangedAt.getTime();
      if (elapsed < cooldownMs) {
        const remainingDays = Math.ceil((cooldownMs - elapsed) / (24 * 60 * 60 * 1000));
        throw new Error(`User ID can only be changed once every ${USER_ID_COOLDOWN_DAYS} days. Please wait ${remainingDays} more days.`);
      }
    }

    // Check availability
    const availability = await this.checkUserIdAvailability(normalizedNew);
    if (!availability.available) {
      throw new Error(availability.error || "User ID is unavailable.");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        userId: normalizedNew,
        userIdChangedAt: new Date(),
      },
    });

    return {
      userId: updated.userId,
      userIdChangedAt: updated.userIdChangedAt,
    };
  }

  /**
   * Requests account deletion, activating the 14-day grace period.
   */
  static async requestAccountDeletion(userId: string, passwordCandidate: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found.");

    const isMatch = await verifyPassword(user.passwordHash, passwordCandidate);
    if (!isMatch) {
      throw new Error("Incorrect password. Deletion request cancelled.");
    }

    const now = new Date();
    await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: AccountStatus.PENDING_DELETION,
        deletionRequestedAt: now,
      },
    });

    return {
      deletionRequestedAt: now,
      gracePeriodDays: ACCOUNT_DELETION_GRACE_DAYS,
    };
  }

  /**
   * Cancels pending account deletion within the 14-day grace period.
   */
  static async cancelAccountDeletion(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found.");

    if (user.accountStatus !== AccountStatus.PENDING_DELETION) {
      throw new Error("This account is not pending deletion.");
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: AccountStatus.ACTIVE,
        deletionRequestedAt: null,
      },
    });

    return { success: true, message: "Account deletion cancelled. Access restored." };
  }

  /**
   * Permanent hard-purge for accounts that have exceeded the 14-day grace period.
   */
  static async purgeExpiredAccounts() {
    const cutoffDate = new Date(Date.now() - ACCOUNT_DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000);

    const expiredUsers = await prisma.user.findMany({
      where: {
        accountStatus: AccountStatus.PENDING_DELETION,
        deletionRequestedAt: { lte: cutoffDate },
      },
      select: { id: true, email: true },
    });

    let purgedCount = 0;
    for (const exp of expiredUsers) {
      await prisma.$transaction(async (tx) => {
        await tx.auditLog.create({
          data: {
            eventType: "PERMANENT_ACCOUNT_PURGE",
            metadata: { email: exp.email, purgedAt: new Date().toISOString() },
          },
        });
        await tx.user.delete({ where: { id: exp.id } });
      });
      purgedCount++;
    }

    return { purgedCount };
  }
}
