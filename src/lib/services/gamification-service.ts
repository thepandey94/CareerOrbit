import prisma from "../db";
import { AssessmentType } from "@prisma/client";

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: "ONBOARDING" | "LEARNING" | "ASSESSMENT" | "STREAK" | "MASTERY";
  iconName: string;
}

export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  FIRST_STEP: {
    id: "FIRST_STEP",
    name: "First Step",
    description: "Selected a career track and generated your personalized learning roadmap.",
    category: "ONBOARDING",
    iconName: "Compass",
  },
  DIAGNOSTIC_EXPLORER: {
    id: "DIAGNOSTIC_EXPLORER",
    name: "Diagnostic Explorer",
    description: "Completed the baseline skill diagnostic assessment.",
    category: "ONBOARDING",
    iconName: "Sparkles",
  },
  KNOWLEDGE_SEEKER: {
    id: "KNOWLEDGE_SEEKER",
    name: "Knowledge Seeker",
    description: "Completed your first daily learning module in the roadmap.",
    category: "LEARNING",
    iconName: "BookOpen",
  },
  ROADMAP_PIONEER: {
    id: "ROADMAP_PIONEER",
    name: "Milestone Finisher",
    description: "Completed 5 or more structured roadmap tasks.",
    category: "LEARNING",
    iconName: "Target",
  },
  CODE_WARRIOR: {
    id: "CODE_WARRIOR",
    name: "Code Warrior",
    description: "Achieved passing score (≥60%) in the Technical Interview Round.",
    category: "ASSESSMENT",
    iconName: "Code2",
  },
  LOGIC_MASTER: {
    id: "LOGIC_MASTER",
    name: "Logic Master",
    description: "Achieved passing score (≥60%) in the Aptitude Assessment.",
    category: "ASSESSMENT",
    iconName: "Brain",
  },
  CONFIDENT_ORATOR: {
    id: "CONFIDENT_ORATOR",
    name: "Confident Speaker",
    description: "Delivered and passed (≥60%) a 7-minute Communication Presentation.",
    category: "ASSESSMENT",
    iconName: "Video",
  },
  TRIPLE_CROWN: {
    id: "TRIPLE_CROWN",
    name: "Placement Ready (Triple Crown)",
    description: "Successfully passed all 3 pillars: Technical, Aptitude, and Communication!",
    category: "MASTERY",
    iconName: "Award",
  },
  STREAK_CHAMPION: {
    id: "STREAK_CHAMPION",
    name: "7-Day Habit",
    description: "Maintained a dedicated 7-day learning streak.",
    category: "STREAK",
    iconName: "Flame",
  },
};

export interface EarnedBadgeRecord {
  badgeId: string;
  earnedAt: string;
  badge: BadgeDefinition;
}

/**
 * Calculates updated streak values flexibly based on user's last active date.
 * If 1 day missed and streak freeze is available, protects the streak.
 */
export function calculateUpdatedStreak(
  currentStreak: number,
  longestStreak: number,
  lastActiveDate: Date | null,
  streakFreezeCount: number,
  today: Date = new Date()
): {
  newStreak: number;
  newLongestStreak: number;
  newStreakFreezeCount: number;
  freezeUsed: boolean;
} {
  if (!lastActiveDate) {
    return {
      newStreak: 1,
      newLongestStreak: Math.max(1, longestStreak),
      newStreakFreezeCount: streakFreezeCount,
      freezeUsed: false,
    };
  }

  // Calculate day difference using UTC calendar dates
  const toUtcDateNumber = (d: Date) =>
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / (1000 * 60 * 60 * 24);

  const diffDays = Math.floor(toUtcDateNumber(today) - toUtcDateNumber(lastActiveDate));

  if (diffDays <= 0) {
    // Already active today; retain streak
    return {
      newStreak: currentStreak,
      newLongestStreak: longestStreak,
      newStreakFreezeCount: streakFreezeCount,
      freezeUsed: false,
    };
  }

  if (diffDays === 1) {
    // Consecutive day
    const updated = currentStreak + 1;
    return {
      newStreak: updated,
      newLongestStreak: Math.max(updated, longestStreak),
      newStreakFreezeCount: streakFreezeCount,
      freezeUsed: false,
    };
  }

  if (diffDays === 2 && streakFreezeCount > 0) {
    // Missed exactly 1 day, but user has an active streak freeze!
    const updated = currentStreak + 1;
    return {
      newStreak: updated,
      newLongestStreak: Math.max(updated, longestStreak),
      newStreakFreezeCount: streakFreezeCount - 1,
      freezeUsed: true,
    };
  }

  // Missed more than 1 day or no freeze available; reset streak to 1
  return {
    newStreak: 1,
    newLongestStreak: longestStreak,
    newStreakFreezeCount: streakFreezeCount,
    freezeUsed: false,
  };
}

export class GamificationService {
  /**
   * Synchronizes and evaluates genuine gamification milestones for a student.
   * Updates flexible streaks and checks database events to grant earned badges.
   */
  static async syncUserGamification(userId: string) {
    // 1. Fetch or create gamification state
    let state = await prisma.gamificationState.findUnique({
      where: { userId },
    });

    if (!state) {
      state = await prisma.gamificationState.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: new Date(),
          streakFreezeCount: 1,
          earnedBadges: [],
          totalPoints: 50,
        },
      });
    }

    // 2. Compute updated streak
    const streakResult = calculateUpdatedStreak(
      state.currentStreak,
      state.longestStreak,
      state.lastActiveDate,
      state.streakFreezeCount
    );

    // 3. Fetch user's actual database activities for genuine badge verification
    const [careerProfile, completedTasksCount, techPassCount, aptPassCount, commPassCount] =
      await Promise.all([
        prisma.careerProfile.findUnique({ where: { userId } }),
        prisma.roadmapTask.count({
          where: { roadmap: { userId }, status: "COMPLETED" },
        }),
        prisma.assessmentAttempt.count({
          where: { userId, assessmentType: AssessmentType.TECHNICAL, passed: true },
        }),
        prisma.assessmentAttempt.count({
          where: { userId, assessmentType: AssessmentType.APTITUDE, passed: true },
        }),
        prisma.communicationSubmission.count({
          where: { userId, passed: true },
        }),
      ]);

    // 4. Parse existing badges
    const existingBadgeIds = new Set<string>();
    const rawBadges = Array.isArray(state.earnedBadges)
      ? (state.earnedBadges as any[])
      : [];

    for (const b of rawBadges) {
      if (typeof b === "string") existingBadgeIds.add(b);
      else if (b?.badgeId) existingBadgeIds.add(b.badgeId);
    }

    const newlyEarnedBadges: string[] = [];
    let pointsToAdd = 0;

    const checkAndAward = (badgeId: string, condition: boolean, pts: number = 100) => {
      if (condition && !existingBadgeIds.has(badgeId)) {
        existingBadgeIds.add(badgeId);
        newlyEarnedBadges.push(badgeId);
        pointsToAdd += pts;
      }
    };

    // Evaluate badge criteria
    checkAndAward("FIRST_STEP", Boolean(careerProfile?.selectedTrack), 50);
    checkAndAward("DIAGNOSTIC_EXPLORER", Boolean(careerProfile?.diagnosticScores), 100);
    checkAndAward("KNOWLEDGE_SEEKER", completedTasksCount >= 1, 50);
    checkAndAward("ROADMAP_PIONEER", completedTasksCount >= 5, 150);
    checkAndAward("CODE_WARRIOR", techPassCount >= 1, 150);
    checkAndAward("LOGIC_MASTER", aptPassCount >= 1, 150);
    checkAndAward("CONFIDENT_ORATOR", commPassCount >= 1, 200);
    checkAndAward(
      "TRIPLE_CROWN",
      techPassCount >= 1 && aptPassCount >= 1 && commPassCount >= 1,
      300
    );
    checkAndAward(
      "STREAK_CHAMPION",
      streakResult.newStreak >= 7 || streakResult.newLongestStreak >= 7,
      200
    );

    // Build serialized badge list
    const updatedBadgeList: Array<{ badgeId: string; earnedAt: string }> = [];
    for (const b of rawBadges) {
      if (typeof b === "string") {
        updatedBadgeList.push({ badgeId: b, earnedAt: state.updatedAt.toISOString() });
      } else if (b?.badgeId) {
        updatedBadgeList.push(b);
      }
    }
    const nowIso = new Date().toISOString();
    for (const bId of newlyEarnedBadges) {
      updatedBadgeList.push({ badgeId: bId, earnedAt: nowIso });
    }

    // 5. Update GamificationState in database
    const updatedState = await prisma.gamificationState.update({
      where: { userId },
      data: {
        currentStreak: streakResult.newStreak,
        longestStreak: streakResult.newLongestStreak,
        lastActiveDate: new Date(),
        streakFreezeCount: streakResult.newStreakFreezeCount,
        earnedBadges: updatedBadgeList as any,
        totalPoints: state.totalPoints + pointsToAdd,
      },
    });

    // Format badges with definitions
    const formattedEarnedBadges: EarnedBadgeRecord[] = updatedBadgeList
      .filter((b) => BADGE_DEFINITIONS[b.badgeId])
      .map((b) => ({
        badgeId: b.badgeId,
        earnedAt: b.earnedAt,
        badge: BADGE_DEFINITIONS[b.badgeId],
      }));

    return {
      currentStreak: updatedState.currentStreak,
      longestStreak: updatedState.longestStreak,
      streakFreezeCount: updatedState.streakFreezeCount,
      totalPoints: updatedState.totalPoints,
      earnedBadges: formattedEarnedBadges,
      newlyEarnedCount: newlyEarnedBadges.length,
      allAvailableBadges: Object.values(BADGE_DEFINITIONS),
    };
  }
}
