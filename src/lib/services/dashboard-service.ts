import prisma from "../db";
import { AssessmentType, AttemptStatus, TaskStatus } from "@prisma/client";
import { GamificationService } from "./gamification-service";

export interface ComponentScore {
  score: number | null;
  completed: boolean;
  weight: number;
  status: string;
  bestAttemptDate?: string;
  passed?: boolean;
}

export interface JobReadinessSummary {
  overallScore: number | null; // null if incomplete; NEVER 0 due to missing scores
  isComplete: boolean;
  technical: ComponentScore;
  aptitude: ComponentScore;
  communication: ComponentScore;
  missingComponents: string[];
  readinessTier: "ELITE" | "STRONG" | "BENCHMARK" | "REVISION_REQUIRED" | "INCOMPLETE";
  tierDescription: string;
}

export interface WeakTopicItem {
  domain: "TECHNICAL" | "APTITUDE" | "COMMUNICATION";
  topic: string;
  reason: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  actionUrl: string;
  actionLabel: string;
}

export interface StudentDashboardPayload {
  user: {
    id: string;
    userId: string;
    fullName: string;
    course: string;
    branch: string;
    semester: number;
    avatarUrl: string | null;
  };
  career: {
    selectedTrack: string | null;
    targetWeeks: number;
    dailyMinutesTarget: number;
    diagnosticScores: any;
  } | null;
  roadmap: {
    id: string;
    title: string;
    currentWeek: number;
    currentDay: number;
    totalTasks: number;
    completedTasks: number;
    availableTasks: number;
    progressPercent: number;
  } | null;
  jobReadiness: JobReadinessSummary;
  weakTopics: WeakTopicItem[];
  recentHistory: Array<{
    id: string;
    type: "TECHNICAL" | "APTITUDE" | "COMMUNICATION";
    title: string;
    score: number;
    maxScore: number;
    passed: boolean;
    date: string;
  }>;
  gamification: {
    currentStreak: number;
    longestStreak: number;
    streakFreezeCount: number;
    totalPoints: number;
    earnedBadges: any[];
    allAvailableBadges: any[];
  };
}

/**
 * Pure calculation function for composite job-readiness score.
 * Enforces the strict rule: if any required component has no valid assessment result,
 * the overall score MUST be returned as null (incomplete) rather than treating missing as zero.
 */
export function calculateJobReadiness(
  technicalScore: number | null,
  aptitudeScore: number | null,
  communicationScore: number | null
): JobReadinessSummary {
  const missingComponents: string[] = [];

  const techComponent: ComponentScore = {
    score: technicalScore !== null ? Math.round(technicalScore) : null,
    completed: technicalScore !== null,
    weight: 0.4,
    status: technicalScore !== null ? `${Math.round(technicalScore)}%` : "Not Attempted",
    passed: technicalScore !== null ? technicalScore >= 60 : false,
  };

  const aptComponent: ComponentScore = {
    score: aptitudeScore !== null ? Math.round(aptitudeScore) : null,
    completed: aptitudeScore !== null,
    weight: 0.3,
    status: aptitudeScore !== null ? `${Math.round(aptitudeScore)}%` : "Not Attempted",
    passed: aptitudeScore !== null ? aptitudeScore >= 60 : false,
  };

  const commComponent: ComponentScore = {
    score: communicationScore !== null ? Math.round(communicationScore) : null,
    completed: communicationScore !== null,
    weight: 0.3,
    status: communicationScore !== null ? `${Math.round(communicationScore)}%` : "Not Attempted",
    passed: communicationScore !== null ? communicationScore >= 60 : false,
  };

  if (technicalScore === null) missingComponents.push("Technical Round");
  if (aptitudeScore === null) missingComponents.push("Aptitude Assessment");
  if (communicationScore === null) missingComponents.push("Communication Presentation");

  if (missingComponents.length > 0) {
    return {
      overallScore: null,
      isComplete: false,
      technical: techComponent,
      aptitude: aptComponent,
      communication: commComponent,
      missingComponents,
      readinessTier: "INCOMPLETE",
      tierDescription: `Incomplete (${3 - missingComponents.length}/3 evaluated). Complete ${missingComponents.join(" and ")} to unlock your Job-Readiness Score.`,
    };
  }

  // All 3 components are present
  const overall = Math.round(
    technicalScore! * 0.4 + aptitudeScore! * 0.3 + communicationScore! * 0.3
  );

  let readinessTier: "ELITE" | "STRONG" | "BENCHMARK" | "REVISION_REQUIRED" = "REVISION_REQUIRED";
  let tierDescription = "Foundational competence. Revise identified weak areas and retake for higher benchmark.";

  if (overall >= 85) {
    readinessTier = "ELITE";
    tierDescription = "Placement Ready (Elite Tier). Exceptional technical, analytical, and communication skills.";
  } else if (overall >= 70) {
    readinessTier = "STRONG";
    tierDescription = "Interview Ready (Strong Competency). Demonstrates solid aptitude across key interview dimensions.";
  } else if (overall >= 60) {
    readinessTier = "BENCHMARK";
    tierDescription = "Certified Benchmark (Passing). Satisfies standard campus recruitment minimum requirements.";
  }

  return {
    overallScore: overall,
    isComplete: true,
    technical: techComponent,
    aptitude: aptComponent,
    communication: commComponent,
    missingComponents: [],
    readinessTier,
    tierDescription,
  };
}

export class DashboardService {
  /**
   * Fetches comprehensive student dashboard data with authentic persisted calculations.
   */
  static async getStudentDashboard(userId: string): Promise<StudentDashboardPayload> {
    // 1. Fetch user core info and career profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        careerProfile: true,
      },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    // 2. Fetch latest active roadmap and tasks
    const roadmap = await prisma.roadmap.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        tasks: {
          select: { id: true, status: true, taskType: true },
        },
      },
    });

    // 3. Fetch assessment attempts and communication presentations
    const [techAttempts, aptAttempts, commSubmissions] = await Promise.all([
      prisma.assessmentAttempt.findMany({
        where: { userId, assessmentType: AssessmentType.TECHNICAL, status: AttemptStatus.SUBMITTED },
        orderBy: { score: "desc" },
      }),
      prisma.assessmentAttempt.findMany({
        where: { userId, assessmentType: AssessmentType.APTITUDE, status: AttemptStatus.SUBMITTED },
        orderBy: { score: "desc" },
      }),
      prisma.communicationSubmission.findMany({
        where: { userId, status: "COMPLETED" },
        orderBy: { overallScore: "desc" },
      }),
    ]);

    // 4. Calculate best component percentages
    const bestTechAttempt = techAttempts[0] || null;
    const bestAptAttempt = aptAttempts[0] || null;
    const bestCommSubmission = commSubmissions[0] || null;

    const techPercent = bestTechAttempt
      ? Math.round((bestTechAttempt.score / Math.max(1, bestTechAttempt.totalQuestions)) * 100)
      : null;

    const aptPercent = bestAptAttempt
      ? Math.round((bestAptAttempt.score / Math.max(1, bestAptAttempt.totalQuestions)) * 100)
      : null;

    const commPercent = bestCommSubmission ? bestCommSubmission.overallScore : null;

    // 5. Compute composite job-readiness
    const jobReadiness = calculateJobReadiness(techPercent, aptPercent, commPercent);

    if (bestTechAttempt) {
      jobReadiness.technical.bestAttemptDate = bestTechAttempt.submittedAt?.toISOString();
    }
    if (bestAptAttempt) {
      jobReadiness.aptitude.bestAttemptDate = bestAptAttempt.submittedAt?.toISOString();
    }
    if (bestCommSubmission) {
      jobReadiness.communication.bestAttemptDate = bestCommSubmission.createdAt.toISOString();
    }

    // 6. Identify weak topics and personalized recommendations from actual performance
    const weakTopics: WeakTopicItem[] = [];

    // Technical assessment diagnostics
    if (techPercent === null) {
      weakTopics.push({
        domain: "TECHNICAL",
        topic: "Technical Coding Assessment",
        reason: "You have not completed an official Technical Coding assessment yet.",
        priority: "HIGH",
        actionUrl: "/technical",
        actionLabel: "Launch Technical Round (25 Qs)",
      });
    } else if (techPercent < 70) {
      weakTopics.push({
        domain: "TECHNICAL",
        topic: "Algorithms & Hidden Edge Cases",
        reason: `Latest score of ${techPercent}% indicates opportunities to improve runtime efficiency and handle boundary conditions.`,
        priority: techPercent < 60 ? "HIGH" : "MEDIUM",
        actionUrl: "/technical",
        actionLabel: "Retake Technical Round",
      });
    }

    // Aptitude diagnostics
    if (aptPercent === null) {
      weakTopics.push({
        domain: "APTITUDE",
        topic: "General Aptitude Assessment",
        reason: "Complete the 25-question Quantitative, Logical, and Verbal diagnostic.",
        priority: "HIGH",
        actionUrl: "/aptitude",
        actionLabel: "Start Aptitude Assessment (25 Qs)",
      });
    } else if (aptPercent < 70) {
      weakTopics.push({
        domain: "APTITUDE",
        topic: "Quantitative & Analytical Speed",
        reason: `Score of ${aptPercent}% shows room for speed drill optimization in mental math and logical deduction.`,
        priority: aptPercent < 60 ? "HIGH" : "MEDIUM",
        actionUrl: "/aptitude",
        actionLabel: "Practice Aptitude Drills",
      });
    }

    // Communication diagnostics
    if (commPercent === null) {
      weakTopics.push({
        domain: "COMMUNICATION",
        topic: "Technical Speaking & Presentation",
        reason: "Practice a timed 7-minute technical presentation with zero video retention.",
        priority: "HIGH",
        actionUrl: "/communication",
        actionLabel: "Enter Presentation Studio",
      });
    } else if (commPercent < 70) {
      const fb = bestCommSubmission?.feedbackJson as any;
      const wpm = fb?.speakingMetrics?.wordsPerMinute;
      const fillers = fb?.speakingMetrics?.totalFillerWords;
      const reasonDetail = wpm
        ? `Observed ${wpm} WPM and ${fillers || 0} filler words. Enhance pause discipline and structure.`
        : `Overall score of ${commPercent}%. Practice structured explanations and technical vocabulary.`;

      weakTopics.push({
        domain: "COMMUNICATION",
        topic: "Presentation Cadence & Verbal Polish",
        reason: reasonDetail,
        priority: commPercent < 60 ? "HIGH" : "MEDIUM",
        actionUrl: "/communication",
        actionLabel: "Practice Another Presentation",
      });
    }

    // Roadmap recommendations
    if (roadmap) {
      const availableTask = roadmap.tasks.find((t) => t.status === TaskStatus.AVAILABLE);
      if (availableTask) {
        weakTopics.push({
          domain: "TECHNICAL",
          topic: "Next Roadmap Task",
          reason: "Continue your daily 90-minute structured study path.",
          priority: "LOW",
          actionUrl: `/roadmap`,
          actionLabel: "Resume Roadmap",
        });
      }
    }

    // 7. Recent Assessment History timeline
    const recentHistory: StudentDashboardPayload["recentHistory"] = [];

    for (const t of techAttempts.slice(0, 3)) {
      recentHistory.push({
        id: t.id,
        type: "TECHNICAL",
        title: `Technical Round (Level ${t.level})`,
        score: t.score,
        maxScore: t.totalQuestions,
        passed: t.passed,
        date: (t.submittedAt || t.startedAt).toISOString(),
      });
    }

    for (const a of aptAttempts.slice(0, 3)) {
      recentHistory.push({
        id: a.id,
        type: "APTITUDE",
        title: "Aptitude Assessment (25 Qs)",
        score: a.score,
        maxScore: a.totalQuestions,
        passed: a.passed,
        date: (a.submittedAt || a.startedAt).toISOString(),
      });
    }

    for (const c of commSubmissions.slice(0, 3)) {
      recentHistory.push({
        id: c.id,
        type: "COMMUNICATION",
        title: c.topicTitle,
        score: c.overallScore,
        maxScore: 100,
        passed: c.passed,
        date: c.createdAt.toISOString(),
      });
    }

    recentHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 8. Roadmap summary
    let roadmapSummary: StudentDashboardPayload["roadmap"] = null;
    if (roadmap) {
      const total = roadmap.tasks.length;
      const completed = roadmap.tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
      const available = roadmap.tasks.filter((t) => t.status === TaskStatus.AVAILABLE).length;
      roadmapSummary = {
        id: roadmap.id,
        title: roadmap.title,
        currentWeek: roadmap.currentWeek,
        currentDay: roadmap.currentDay,
        totalTasks: total,
        completedTasks: completed,
        availableTasks: available,
        progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    }

    // 9. Sync gamification state
    const gamification = await GamificationService.syncUserGamification(userId);

    return {
      user: {
        id: user.id,
        userId: user.userId,
        fullName: user.fullName,
        course: user.course,
        branch: user.branch,
        semester: user.semester,
        avatarUrl: user.avatarUrl,
      },
      career: user.careerProfile
        ? {
            selectedTrack: user.careerProfile.selectedTrack,
            targetWeeks: user.careerProfile.targetWeeks,
            dailyMinutesTarget: user.careerProfile.dailyMinutesTarget,
            diagnosticScores: user.careerProfile.diagnosticScores,
          }
        : null,
      roadmap: roadmapSummary,
      jobReadiness,
      weakTopics: weakTopics.slice(0, 4),
      recentHistory: recentHistory.slice(0, 6),
      gamification,
    };
  }
}
