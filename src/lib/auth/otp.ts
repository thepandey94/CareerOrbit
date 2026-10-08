import crypto from "node:crypto";

export const OTP_EXPIRY_MINUTES = 10;
export const MAX_OTP_ATTEMPTS = 5;
export const OTP_COOLDOWN_SECONDS = 60;

export interface GeneratedOtp {
  code: string;
  hash: string;
  expiresAt: Date;
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP
 * and returns its code, salted SHA-256 hash, and expiration timestamp.
 */
export function generateOtp(): GeneratedOtp {
  const code = crypto.randomInt(100000, 1000000).toString();
  const hash = hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  return {
    code,
    hash,
    expiresAt,
  };
}

/**
 * Hashes an OTP string using SHA-256 with an internal salt.
 */
export function hashOtp(code: string): string {
  return crypto
    .createHash("sha256")
    .update(`careerorbit-otp-salt:${code.trim()}`)
    .digest("hex");
}

/**
 * Verifies a candidate code against the stored hash.
 */
export function verifyOtpCode(candidateCode: string, storedHash: string): boolean {
  if (!candidateCode || !storedHash) return false;
  const candidateHash = hashOtp(candidateCode);
  return crypto.timingSafeEqual(
    Buffer.from(candidateHash, "hex"),
    Buffer.from(storedHash, "hex")
  );
}
