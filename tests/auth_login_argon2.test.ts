import { describe, it, expect } from "vitest";
import { validatePasswordStrength, hashPassword, verifyPassword } from "../src/lib/auth/password";

describe("Authentication: Argon2id Password Security", () => {
  it("should reject passwords under 12 characters", () => {
    const result = validatePasswordStrength("Short1!");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("at least 12 characters");
  });

  it("should reject common easily-guessed passwords", () => {
    const result = validatePasswordStrength("password12345");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("too common");
  });

  it("should reject passwords missing uppercase, lowercase, or numbers", () => {
    const noUpper = validatePasswordStrength("lowercaseonly123");
    expect(noUpper.isValid).toBe(false);

    const noNumber = validatePasswordStrength("NoNumbersInThisPassword");
    expect(noNumber.isValid).toBe(false);
  });

  it("should accept compliant strong passwords", () => {
    const valid = validatePasswordStrength("SecureOrbit2026!Strong");
    expect(valid.isValid).toBe(true);
  });

  it("should hash with Argon2id and verify correctly", async () => {
    const plain = "ValidPassword123#Secure";
    const hashed = await hashPassword(plain);

    expect(hashed).toMatch(/^\$argon2id\$/); // Confirms Argon2id format
    
    const isMatch = await verifyPassword(hashed, plain);
    expect(isMatch).toBe(true);

    const isWrong = await verifyPassword(hashed, "WrongPassword123#Secure");
    expect(isWrong).toBe(false);
  });
});
