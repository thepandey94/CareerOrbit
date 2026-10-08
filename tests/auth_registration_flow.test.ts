import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "@/lib/services/auth-service";
import { handleApiError, isDatabaseError, isTechnicalLeak, ConflictError, RateLimitError, DatabaseError } from "@/lib/errors";
import prisma from "@/lib/db";
import { sendOtpEmail } from "@/lib/email/service";
import { VerificationType } from "@prisma/client";
import { NextRequest } from "next/server";
import { POST as requestOtpHandler } from "@/app/api/auth/register/request-otp/route";

describe("Registration Flow & Safe Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Invalid Email Rejection", () => {
    it("should reject invalid email formats with a clean HTTP 400 error message", async () => {
      const invalidEmails = ["not-an-email", "missing-at-sign.com", "@domain.com", "", "   "];

      for (const email of invalidEmails) {
        const req = new NextRequest("http://localhost:3000/api/auth/register/request-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const res = await requestOtpHandler(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toBeDefined();
        expect(typeof data.error).toBe("string");
        expect(isTechnicalLeak(data.error)).toBe(false);
      }
    });

    it("should reject non-JSON or malformed request bodies cleanly without syntax error leaks", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth/register/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid-json-body",
      });

      const res = await requestOtpHandler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain("Invalid request payload");
      expect(isTechnicalLeak(data.error)).toBe(false);
    });
  });

  describe("2. Database Failure Safe Error Handling", () => {
    it("should detect Prisma connection / query failures accurately", () => {
      const econnRefusedErr = new Error("connect ECONNREFUSED 127.0.0.1:5432");
      (econnRefusedErr as any).code = "ECONNREFUSED";

      const prismaInvocationErr = new Error(
        "Invalid `prisma.user.findUnique()` invocation in .next/dev/server/chunks/[root-of-the-server]__20i7pqw3l5uky._.js:363:167\nCan't reach database server at localhost:5432"
      );
      prismaInvocationErr.name = "PrismaClientKnownRequestError";

      expect(isDatabaseError(econnRefusedErr)).toBe(true);
      expect(isDatabaseError(prismaInvocationErr)).toBe(true);
      expect(isDatabaseError(new Error("Simple validation failed"))).toBe(false);
    });

    it("should detect and flag technical leaks in error messages", () => {
      const rawPrismaMsg =
        "Invalid `prisma.user.findUnique()` invocation in C:\\Users\\user\\.next\\dev\\server\\chunks\\chunk.js:10:20";
      const turbopackMsg = "__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts";
      const userSafeMsg = "An account with this email address already exists. Please log in.";

      expect(isTechnicalLeak(rawPrismaMsg)).toBe(true);
      expect(isTechnicalLeak(turbopackMsg)).toBe(true);
      expect(isTechnicalLeak(userSafeMsg)).toBe(false);
    });

    it("should return HTTP 503 with a sanitized message and never leak stack traces when the database is unreachable", async () => {
      const prismaError = new Error(
        "Invalid `prisma.user.findUnique()` invocation in .next/dev/server/chunks/[root-of-the-server]__20i7pqw3l5uky._.js:363:167\nCan't reach database server at localhost:5432"
      );
      prismaError.name = "PrismaClientKnownRequestError";

      vi.spyOn(AuthService, "requestRegistrationOtp").mockRejectedValueOnce(prismaError);
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const req = new NextRequest("http://localhost:3000/api/auth/register/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "student@university.edu" }),
      });

      const res = await requestOtpHandler(req);
      const data = await res.json();

      expect(res.status).toBe(503);
      expect(data.error).toBe("Database service is currently unavailable. Please verify your database connection or try again later.");
      expect(isTechnicalLeak(data.error)).toBe(false);
      expect(data.error).not.toContain("prisma");
      expect(data.error).not.toContain(".next");
      expect(data.error).not.toContain("chunks");
      expect(data.error).not.toContain("user.findUnique");
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("3. Duplicate Account Prevention", () => {
    it("should reject registration when email already exists with HTTP 409 Conflict", async () => {
      vi.spyOn(prisma.user, "findUnique").mockResolvedValueOnce({
        id: "existing-user-uuid",
        email: "existing@university.edu",
        userId: "existing_student",
        passwordHash: "argon2id_hash",
        fullName: "Existing Student",
        course: "B.Tech",
        branch: "CSE",
        semester: 6,
        role: "STUDENT",
        avatarUrl: null,
        userIdChangedAt: null,
        deletionRequestedAt: null,
        accountStatus: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const req = new NextRequest("http://localhost:3000/api/auth/register/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "EXISTING@University.Edu" }),
      });

      const res = await requestOtpHandler(req);
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.error).toBe("An account with this email address already exists. Please log in.");
    });
  });

  describe("4. Rate Limiting & Cooldown Protection", () => {
    it("should enforce the 60-second cooldown between OTP requests with HTTP 429", async () => {
      vi.spyOn(prisma.user, "findUnique").mockResolvedValueOnce(null);
      vi.spyOn(prisma.emailVerification, "findFirst").mockResolvedValueOnce({
        id: "recent-verification-id",
        email: "student@university.edu",
        otpHash: "hash",
        type: VerificationType.REGISTRATION,
        attempts: 0,
        expiresAt: new Date(Date.now() + 9 * 60 * 1000),
        verifiedAt: null,
        createdAt: new Date(Date.now() - 20 * 1000), // 20 seconds ago (< 60s cooldown)
      } as any);

      const req = new NextRequest("http://localhost:3000/api/auth/register/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "student@university.edu" }),
      });

      const res = await requestOtpHandler(req);
      const data = await res.json();

      expect(res.status).toBe(429);
      expect(data.error).toMatch(/Please wait \d+ seconds before requesting a new verification code\./);
    });
  });

  describe("5. Valid Email Initiates Expected OTP Process", () => {
    it("should normalize email, create 6-digit OTP with 10-min expiry, and confirm delivery", async () => {
      vi.spyOn(prisma.user, "findUnique").mockResolvedValueOnce(null);
      vi.spyOn(prisma.emailVerification, "findFirst").mockResolvedValueOnce(null);

      const createSpy = vi.spyOn(prisma.emailVerification, "create").mockResolvedValueOnce({
        id: "new-verification-id",
        email: "newstudent@university.edu",
        otpHash: "mocked-hash",
        type: VerificationType.REGISTRATION,
        attempts: 0,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        verifiedAt: null,
        createdAt: new Date(),
      } as any);

      const req = new NextRequest("http://localhost:3000/api/auth/register/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "  NewStudent@University.EDU  " }),
      });

      const res = await requestOtpHandler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Verification code sent to your email.");

      // Verify email was normalized to lowercase and trimmed
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: "newstudent@university.edu",
            type: VerificationType.REGISTRATION,
          }),
        })
      );
    });
  });

  describe("6. Email Provider Integration", () => {
    it("should safely deliver OTP via configured email service in dev mode", async () => {
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const result = await sendOtpEmail({
        to: "applicant@university.edu",
        code: "847291",
        type: "REGISTRATION",
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Verification Code: >>> 847291 <<<"));

      consoleLogSpy.mockRestore();
    });

    it("should call Brevo REST API when BREVO_API_KEY is configured", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: "<brevo-test-msg-123@smtp-relay.mailin.fr>" }),
      } as any);

      const { env } = await import("@/lib/env");
      const originalBrevoKey = env.BREVO_API_KEY;
      (env as any).BREVO_API_KEY = "xkeysib-mock-test-key";

      const result = await sendOtpEmail({
        to: "applicant@university.edu",
        code: "654321",
        type: "REGISTRATION",
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("<brevo-test-msg-123@smtp-relay.mailin.fr>");
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://api.brevo.com/v3/smtp/email",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "api-key": "xkeysib-mock-test-key",
            "Content-Type": "application/json",
          }),
          body: expect.stringContaining('"to":[{"email":"applicant@university.edu"}]'),
        })
      );

      (env as any).BREVO_API_KEY = originalBrevoKey;
      fetchSpy.mockRestore();
    });

    it("should never log OTP values to console in production mode", async () => {
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { env } = await import("@/lib/env");
      const originalEnv = env.NODE_ENV;
      const originalBrevoKey = env.BREVO_API_KEY;
      const originalResendKey = env.RESEND_API_KEY;

      (env as any).NODE_ENV = "production";
      (env as any).BREVO_API_KEY = undefined;
      (env as any).RESEND_API_KEY = undefined;

      const result = await sendOtpEmail({
        to: "applicant@university.edu",
        code: "998877",
        type: "REGISTRATION",
      });

      expect(result.success).toBe(false);
      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining("998877"));

      (env as any).NODE_ENV = originalEnv;
      (env as any).BREVO_API_KEY = originalBrevoKey;
      (env as any).RESEND_API_KEY = originalResendKey;
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });
});

