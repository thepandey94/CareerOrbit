import { hash, verify } from "@node-rs/argon2";

// Argon2id configuration aligned with OWASP recommendations
const ARGON2_OPTIONS = {
  memoryCost: 65536, // 64 MB
  timeCost: 3,       // 3 iterations
  outputLen: 32,
  parallelism: 1,
};

// Common weak/compromised passwords list for preliminary offline screening
const COMMON_WEAK_PASSWORDS = new Set([
  "password12345",
  "123456789012",
  "qwertyuiopas",
  "administrator",
  "admin1234567",
  "welcome12345",
  "changeme1234",
  "letmein12345",
  "iloveyou1234",
  "careerorbit12",
]);

export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  if (!password || password.length < 12) {
    return {
      isValid: false,
      error: "Password must be at least 12 characters long.",
    };
  }

  if (COMMON_WEAK_PASSWORDS.has(password.toLowerCase())) {
    return {
      isValid: false,
      error: "This password is too common and easily guessed. Please choose a stronger password.",
    };
  }

  // Ensure password contains character variety
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return {
      isValid: false,
      error: "Password must include at least one uppercase letter, one lowercase letter, and one number.",
    };
  }

  return { isValid: true };
}

export async function hashPassword(password: string): Promise<string> {
  const validation = validatePasswordStrength(password);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  return hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(hashString: string, candidate: string): Promise<boolean> {
  if (!hashString || !candidate) {
    return false;
  }
  try {
    return await verify(hashString, candidate);
  } catch {
    return false;
  }
}
