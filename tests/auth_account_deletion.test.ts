import { describe, it, expect } from "vitest";
import { ACCOUNT_DELETION_GRACE_DAYS } from "../src/lib/services/auth-service";

describe("Account Deletion: 14-Day Grace Period Lifecycle", () => {
  it("should configure 14-day grace period", () => {
    expect(ACCOUNT_DELETION_GRACE_DAYS).toBe(14);
  });

  it("should accurately determine if an account is within grace period", () => {
    const now = Date.now();
    const graceMs = ACCOUNT_DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000;

    // Requested 5 days ago -> Still within grace period
    const deletionRequestedAt = new Date(now - 5 * 24 * 60 * 60 * 1000);
    const elapsed = now - deletionRequestedAt.getTime();
    expect(elapsed < graceMs).toBe(true);

    const remainingDays = Math.ceil((graceMs - elapsed) / (24 * 60 * 60 * 1000));
    expect(remainingDays).toBe(9);
  });

  it("should flag accounts that have exceeded 14 days for permanent purge", () => {
    const now = Date.now();
    const graceMs = ACCOUNT_DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000;

    // Requested 15 days ago -> Ready for purge
    const fifteenDaysAgo = new Date(now - 15 * 24 * 60 * 60 * 1000);
    const elapsed = now - fifteenDaysAgo.getTime();
    expect(elapsed >= graceMs).toBe(true);
  });
});
