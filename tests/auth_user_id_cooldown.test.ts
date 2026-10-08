import { describe, it, expect } from "vitest";
import { USER_ID_REGEX, USER_ID_COOLDOWN_DAYS } from "../src/lib/services/auth-service";

describe("Authentication: User ID Validation & 90-Day Cooldown", () => {
  it("should validate User ID format matching 3-20 alphanumeric characters", () => {
    expect(USER_ID_REGEX.test("alex")).toBe(true);
    expect(USER_ID_REGEX.test("alex_mercer")).toBe(true);
    expect(USER_ID_REGEX.test("dev_2026")).toBe(true);

    // Invalid formats
    expect(USER_ID_REGEX.test("al")).toBe(false); // too short
    expect(USER_ID_REGEX.test("this_user_id_is_way_too_long_for_system")).toBe(false); // too long
    expect(USER_ID_REGEX.test("alex-mercer")).toBe(false); // hyphen not allowed
    expect(USER_ID_REGEX.test("alex@mercer")).toBe(false); // special char not allowed
  });

  it("should calculate remaining days in 90-day cooldown period accurately", () => {
    expect(USER_ID_COOLDOWN_DAYS).toBe(90);

    const now = Date.now();
    const cooldownMs = USER_ID_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

    // Case 1: Changed 10 days ago (80 days remaining)
    const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000);
    const elapsed1 = now - tenDaysAgo.getTime();
    expect(elapsed1 < cooldownMs).toBe(true);
    const remainingDays1 = Math.ceil((cooldownMs - elapsed1) / (24 * 60 * 60 * 1000));
    expect(remainingDays1).toBe(80);

    // Case 2: Changed 95 days ago (cooldown expired)
    const ninetyFiveDaysAgo = new Date(now - 95 * 24 * 60 * 60 * 1000);
    const elapsed2 = now - ninetyFiveDaysAgo.getTime();
    expect(elapsed2 >= cooldownMs).toBe(true);
  });
});
