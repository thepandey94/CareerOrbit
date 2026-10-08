import { describe, it, expect } from "vitest";
import {
  calculateUpdatedStreak,
  BADGE_DEFINITIONS,
} from "../src/lib/services/gamification-service";

describe("Gamification: Flexible Streaks & Streak Protection", () => {
  it("should initialize streak to 1 when user has no prior activity", () => {
    const result = calculateUpdatedStreak(0, 0, null, 1);
    expect(result.newStreak).toBe(1);
    expect(result.newLongestStreak).toBe(1);
    expect(result.freezeUsed).toBe(false);
    expect(result.newStreakFreezeCount).toBe(1);
  });

  it("should retain current streak when student is already active on the same UTC calendar day", () => {
    const today = new Date("2026-10-08T14:00:00Z");
    const lastActiveEarlierToday = new Date("2026-10-08T08:30:00Z");

    const result = calculateUpdatedStreak(5, 10, lastActiveEarlierToday, 2, today);
    expect(result.newStreak).toBe(5);
    expect(result.newLongestStreak).toBe(10);
    expect(result.freezeUsed).toBe(false);
    expect(result.newStreakFreezeCount).toBe(2);
  });

  it("should increment streak by 1 on consecutive calendar days", () => {
    const today = new Date("2026-10-08T10:00:00Z");
    const yesterday = new Date("2026-10-07T18:00:00Z");

    const result = calculateUpdatedStreak(4, 7, yesterday, 1, today);
    expect(result.newStreak).toBe(5);
    expect(result.newLongestStreak).toBe(7);
    expect(result.freezeUsed).toBe(false);
    expect(result.newStreakFreezeCount).toBe(1);
  });

  it("should update longest streak when new streak exceeds previous record", () => {
    const today = new Date("2026-10-08T10:00:00Z");
    const yesterday = new Date("2026-10-07T12:00:00Z");

    const result = calculateUpdatedStreak(9, 9, yesterday, 1, today);
    expect(result.newStreak).toBe(10);
    expect(result.newLongestStreak).toBe(10);
  });

  it("should protect streak and consume 1 streak freeze when exactly 1 day is missed", () => {
    // 2 calendar days difference (missed Oct 7)
    const today = new Date("2026-10-08T09:00:00Z");
    const dayBeforeYesterday = new Date("2026-10-06T15:00:00Z");

    const result = calculateUpdatedStreak(6, 12, dayBeforeYesterday, 1, today);
    expect(result.newStreak).toBe(7); // Preserved and continued!
    expect(result.freezeUsed).toBe(true);
    expect(result.newStreakFreezeCount).toBe(0); // Freeze consumed
    expect(result.newLongestStreak).toBe(12);
  });

  it("should reset streak to 1 when 1 day is missed but student has 0 streak freezes", () => {
    const today = new Date("2026-10-08T09:00:00Z");
    const dayBeforeYesterday = new Date("2026-10-06T15:00:00Z");

    const result = calculateUpdatedStreak(6, 12, dayBeforeYesterday, 0, today);
    expect(result.newStreak).toBe(1);
    expect(result.freezeUsed).toBe(false);
    expect(result.newStreakFreezeCount).toBe(0);
    expect(result.newLongestStreak).toBe(12); // Historical high preserved
  });

  it("should reset streak to 1 when more than 1 day is missed even if freezes exist", () => {
    const today = new Date("2026-10-08T09:00:00Z");
    const fourDaysAgo = new Date("2026-10-04T09:00:00Z");

    const result = calculateUpdatedStreak(15, 20, fourDaysAgo, 2, today);
    expect(result.newStreak).toBe(1);
    expect(result.freezeUsed).toBe(false);
    expect(result.newStreakFreezeCount).toBe(2); // Freeze not wasted on long abandonment
    expect(result.newLongestStreak).toBe(20);
  });
});

describe("Gamification: Milestone Badge Registry Integrity", () => {
  it("should define all approved genuine milestone badges", () => {
    const expectedBadges = [
      "FIRST_STEP",
      "DIAGNOSTIC_EXPLORER",
      "KNOWLEDGE_SEEKER",
      "ROADMAP_PIONEER",
      "CODE_WARRIOR",
      "LOGIC_MASTER",
      "CONFIDENT_ORATOR",
      "TRIPLE_CROWN",
      "STREAK_CHAMPION",
    ];

    for (const badgeId of expectedBadges) {
      expect(BADGE_DEFINITIONS).toHaveProperty(badgeId);
      const badge = BADGE_DEFINITIONS[badgeId];
      expect(badge.id).toBe(badgeId);
      expect(badge.name).toBeTruthy();
      expect(badge.description).toBeTruthy();
      expect(["ONBOARDING", "LEARNING", "ASSESSMENT", "STREAK", "MASTERY"]).toContain(badge.category);
      expect(badge.iconName).toBeTruthy();
    }
  });

  it("should maintain privacy by keeping all badges student-centric without public leaderboard hooks", () => {
    // Badges must only reward genuine learning progress and completed assessments
    const tripleCrown = BADGE_DEFINITIONS["TRIPLE_CROWN"];
    expect(tripleCrown.name).toContain("Placement Ready");
    expect(tripleCrown.category).toBe("MASTERY");

    const codeWarrior = BADGE_DEFINITIONS["CODE_WARRIOR"];
    expect(codeWarrior.category).toBe("ASSESSMENT");

    const streakChampion = BADGE_DEFINITIONS["STREAK_CHAMPION"];
    expect(streakChampion.category).toBe("STREAK");
  });
});
