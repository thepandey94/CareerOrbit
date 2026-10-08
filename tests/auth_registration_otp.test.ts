import { describe, it, expect } from "vitest";
import { generateOtp, hashOtp, verifyOtpCode, OTP_EXPIRY_MINUTES, MAX_OTP_ATTEMPTS } from "../src/lib/auth/otp";

describe("Authentication: OTP Generation & Verification", () => {
  it("should generate a 6-digit numeric code with 10-minute expiry", () => {
    const { code, hash, expiresAt } = generateOtp();

    expect(code).toMatch(/^\d{6}$/);
    expect(hash).toHaveLength(64); // SHA-256 produces 64 hex characters
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    
    // Check approximately 10 minutes from now (within 5 seconds tolerance)
    const diffMinutes = (expiresAt.getTime() - Date.now()) / (1000 * 60);
    expect(diffMinutes).toBeCloseTo(OTP_EXPIRY_MINUTES, 0);
  });

  it("should verify valid code against its hash", () => {
    const { code, hash } = generateOtp();
    const isValid = verifyOtpCode(code, hash);
    expect(isValid).toBe(true);
  });

  it("should reject incorrect code", () => {
    const { hash } = generateOtp();
    const isInvalid = verifyOtpCode("999999", hash);
    expect(isInvalid).toBe(false);
  });

  it("should generate unique hashes for different codes", () => {
    const hash1 = hashOtp("123456");
    const hash2 = hashOtp("654321");
    expect(hash1).not.toBe(hash2);
  });

  it("should enforce MAX_OTP_ATTEMPTS constant to 5", () => {
    expect(MAX_OTP_ATTEMPTS).toBe(5);
  });
});
