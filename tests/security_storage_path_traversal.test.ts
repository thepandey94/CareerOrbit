import { describe, it, expect } from "vitest";
import { sanitizeStorageKey } from "../src/lib/communication/privacy-storage";

describe("Security Hardening: Ephemeral Storage Path Traversal Defense", () => {
  it("should safely allow clean alphanumeric and hyphen/underscore storage keys", () => {
    const validKey = "rec_1728392182_a1b2c3d4";
    expect(sanitizeStorageKey(validKey)).toBe(validKey);

    const validKeyWithDashes = "rec-custom_session-12345";
    expect(sanitizeStorageKey(validKeyWithDashes)).toBe(validKeyWithDashes);
  });

  it("should neutralize directory traversal sequences (../ and ..\\)", () => {
    const maliciousTraversal = "../../etc/passwd";
    const sanitized = sanitizeStorageKey(maliciousTraversal);
    expect(sanitized).toBe("passwd");
    expect(sanitized).not.toContain("..");
    expect(sanitized).not.toContain("/");

    const windowsTraversal = "..\\..\\windows\\system32\\cmd";
    const sanitizedWin = sanitizeStorageKey(windowsTraversal);
    expect(sanitizedWin).not.toContain("..");
    expect(sanitizedWin).not.toContain("\\");
  });

  it("should strip control characters, spaces, and path separators", () => {
    const dangerousKey = "rec_1234;rm -rf test";
    const sanitized = sanitizeStorageKey(dangerousKey);
    expect(sanitized).toBe("rec_1234rm-rftest");
    expect(sanitized).not.toContain(";");
    expect(sanitized).not.toContain(" ");
  });

  it("should throw an error if an attacker provides an empty or entirely invalid key", () => {
    expect(() => sanitizeStorageKey("")).toThrow(/Invalid or unsafe storage key/);
    expect(() => sanitizeStorageKey("../..")).toThrow(/Invalid or unsafe storage key/);
    expect(() => sanitizeStorageKey("///")).toThrow(/Invalid or unsafe storage key/);
  });
});
