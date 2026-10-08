import { prisma } from "../db";
import { completeStudentTask } from "./roadmap-service";
import { getCurriculumForTrack } from "../roadmap/curriculum-data";
import { CareerTrackType } from "../onboarding/scoring";

export interface DailySubmissionItem {
  questionId: string;
  selectedOptionId: string;
}

export async function getDailyAssessmentQuestions(userId: string, taskId: string) {
  const task = await prisma.roadmapTask.findUnique({
    where: { id: taskId },
    include: { roadmap: true },
  });

  if (!task || task.roadmap.userId !== userId) {
    throw new Error("Task not found or unauthorized");
  }

  const curriculum = getCurriculumForTrack(task.roadmap.trackId as CareerTrackType);
  const weekCurr = curriculum.find((w) => w.weekNumber === task.weekNumber);
  const dayCurr = weekCurr?.days.find((d) => d.dayNumber === task.dayNumber);

  if (!dayCurr) {
    throw new Error("Curriculum day not found for this task");
  }

  // Sanitize: strip out correctOptionId and explanation before sending to client
  const sanitizedQuestions = dayCurr.assessment.questions.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    options: q.options,
  }));

  // Fetch past attempts for this task/user
  const previousAttempts = await prisma.assessmentAttempt.findMany({
    where: {
      userId,
      assessmentType: "DAILY",
      level: task.dayNumber,
    },
    orderBy: { startedAt: "desc" },
  });

  return {
    taskId: task.id,
    dayNumber: task.dayNumber,
    title: dayCurr.assessment.title,
    description: dayCurr.assessment.description,
    durationMinutes: dayCurr.assessment.durationMinutes,
    passingScorePercentage: dayCurr.assessment.passingScorePercentage,
    totalQuestions: sanitizedQuestions.length,
    questions: sanitizedQuestions,
    previousAttemptsCount: previousAttempts.length,
    hasPassed: previousAttempts.some((a) => a.passed),
    bestScore: previousAttempts.length > 0 ? Math.max(...previousAttempts.map((a) => a.score)) : 0,
  };
}

export async function submitDailyAssessment(
  userId: string,
  taskId: string,
  submissions: DailySubmissionItem[]
) {
  const task = await prisma.roadmapTask.findUnique({
    where: { id: taskId },
    include: { roadmap: true },
  });

  if (!task || task.roadmap.userId !== userId) {
    throw new Error("Task not found or unauthorized");
  }

  const curriculum = getCurriculumForTrack(task.roadmap.trackId as CareerTrackType);
  const weekCurr = curriculum.find((w) => w.weekNumber === task.weekNumber);
  const dayCurr = weekCurr?.days.find((d) => d.dayNumber === task.dayNumber);

  if (!dayCurr) {
    throw new Error("Curriculum day not found");
  }

  const questions = dayCurr.assessment.questions;
  let correctCount = 0;
  const reviewItems: any[] = [];
  const weakTopics: string[] = [];

  for (const q of questions) {
    const sub = submissions.find((s) => s.questionId === q.id);
    const selectedOptionId = sub?.selectedOptionId || "";
    const isCorrect = selectedOptionId === q.correctOptionId;

    if (isCorrect) {
      correctCount++;
    } else {
      weakTopics.push(`Day ${task.dayNumber} Focus: ${dayCurr.topics[0] || "Foundations"}`);
    }

    const selectedOptionText =
      q.options.find((o) => o.id === selectedOptionId)?.text || "No option selected";
    const correctOptionText =
      q.options.find((o) => o.id === q.correctOptionId)?.text || "";

    reviewItems.push({
      questionId: q.id,
      prompt: q.prompt,
      userAnswer: selectedOptionText,
      correctAnswer: correctOptionText,
      isCorrect,
      explanation: q.explanation,
    });
  }

  const totalQuestions = questions.length;
  const percentageScore = Math.round((correctCount / totalQuestions) * 100);
  const passed = percentageScore >= dayCurr.assessment.passingScorePercentage;

  // Record attempt in database
  const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 min window
  const attempt = await prisma.assessmentAttempt.create({
    data: {
      userId,
      assessmentType: "DAILY",
      level: task.dayNumber,
      score: percentageScore,
      totalQuestions,
      passed,
      submittedAt: new Date(),
      expiresAt,
      status: "SUBMITTED",
    },
  });

  let newlyUnlockedTaskIds: string[] = [];

  // If passed, mark task as COMPLETED and unlock downstream tasks
  if (passed) {
    const completeResult = await completeStudentTask(userId, taskId);
    newlyUnlockedTaskIds = completeResult.newlyUnlockedTaskIds;
  }

  // Retrieve attempt statistics (first, latest, best)
  const allAttempts = await prisma.assessmentAttempt.findMany({
    where: {
      userId,
      assessmentType: "DAILY",
      level: task.dayNumber,
    },
    orderBy: { startedAt: "asc" },
  });

  const firstScore = allAttempts[0]?.score ?? percentageScore;
  const latestScore = percentageScore;
  const bestScore = Math.max(...allAttempts.map((a) => a.score), percentageScore);

  return {
    attemptId: attempt.id,
    score: percentageScore,
    correctCount,
    totalQuestions,
    passed,
    passingThreshold: dayCurr.assessment.passingScorePercentage,
    firstScore,
    latestScore,
    bestScore,
    attemptNumber: allAttempts.length,
    newlyUnlockedTaskIds,
    reviewItems,
    weakTopics: Array.from(new Set(weakTopics)),
    revisionRecommendation: passed
      ? "Congratulations! You have demonstrated mastery of today's topics and unlocked the next module."
      : "You scored below the 60% passing threshold. Review the solution explanations above, revisit today's learning module, and retry when you feel ready.",
  };
}
