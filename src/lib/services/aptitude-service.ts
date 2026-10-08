import { prisma } from "../db";
import {
  getAptitudeQuestions,
  AssessmentQuestion,
} from "../assessments/question-bank";

export interface AptitudeAnswerInput {
  questionId: string;
  selectedOptionId?: string;
}

export interface CategoryBreakdown {
  category: "QUANTITATIVE" | "LOGICAL" | "VERBAL";
  total: number;
  earned: number;
  percentage: number;
}

export async function getAptitudeOverview(userId: string) {
  const attempts = await prisma.assessmentAttempt.findMany({
    where: {
      userId,
      assessmentType: "APTITUDE",
    },
    orderBy: { startedAt: "desc" },
    include: {
      answers: true,
    },
  });

  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter((a) => a.passed).length;
  const bestScore = totalAttempts > 0 ? Math.max(...attempts.map((a) => a.score)) : 0;
  const latestAttempt = attempts[0] || null;

  return {
    totalAttempts,
    passedAttempts,
    bestScore,
    latestAttempt: latestAttempt
      ? {
          id: latestAttempt.id,
          level: latestAttempt.level,
          score: latestAttempt.score,
          totalQuestions: latestAttempt.totalQuestions,
          passed: latestAttempt.passed,
          status: latestAttempt.status,
          submittedAt: latestAttempt.submittedAt,
        }
      : null,
    structure: {
      totalQuestions: 25,
      durationMinutes: 45,
      passingThresholdScore: 15,
      passingThresholdPercent: 60,
      distribution: [
        { section: "Quantitative Aptitude", count: 10, topics: "Percentages, Ratios, Time & Work, Speed-Distance, Probability" },
        { section: "Logical Reasoning", count: 8, topics: "Number Series, Blood Relations, Syllogisms, Coding-Decoding" },
        { section: "Verbal Ability", count: 7, topics: "Vocabulary, Sentence Correction, Reading Comprehension" },
      ],
    },
  };
}

export async function startAptitudeAttempt(userId: string, level: number = 1) {
  const now = new Date();

  // Check for existing in-progress attempt
  const existingAttempt = await prisma.assessmentAttempt.findFirst({
    where: {
      userId,
      assessmentType: "APTITUDE",
      level,
      status: "IN_PROGRESS",
    },
    orderBy: { startedAt: "desc" },
  });

  let attempt = existingAttempt;

  if (attempt) {
    if (new Date(attempt.expiresAt) <= now) {
      await prisma.assessmentAttempt.update({
        where: { id: attempt.id },
        data: { status: "EXPIRED" },
      });
      attempt = null;
    }
  }

  if (!attempt) {
    // 45-minute timed duration for 25 questions
    const expiresAt = new Date(Date.now() + 45 * 60 * 1000);
    attempt = await prisma.assessmentAttempt.create({
      data: {
        userId,
        assessmentType: "APTITUDE",
        level,
        score: 0,
        totalQuestions: 25,
        passed: false,
        status: "IN_PROGRESS",
        startedAt: now,
        expiresAt,
      },
    });
  }

  const rawQuestions = getAptitudeQuestions(level);

  // Sanitize: strip out correctOptionId and solutionExplanation
  const sanitizedQuestions = rawQuestions.map((q) => ({
    id: q.id,
    topic: q.topic,
    category: q.category,
    difficulty: q.difficulty,
    prompt: q.prompt,
    options: q.options,
  }));

  return {
    attemptId: attempt.id,
    level: attempt.level,
    totalQuestions: 25,
    startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt,
    durationMinutes: 45,
    passingThresholdPercent: 60,
    passingThresholdScore: 15,
    questions: sanitizedQuestions,
  };
}

export async function submitAptitudeAttempt(
  userId: string,
  attemptId: string,
  answers: AptitudeAnswerInput[]
) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: { answers: true },
  });

  if (!attempt || attempt.userId !== userId) {
    throw new Error("Attempt not found or unauthorized.");
  }

  if (attempt.status === "SUBMITTED") {
    return getAptitudeAttemptResult(userId, attemptId);
  }

  const now = new Date();
  const isTimeExpired = new Date(attempt.expiresAt) < now;
  const status = isTimeExpired ? "EXPIRED" : "SUBMITTED";

  const questions = getAptitudeQuestions(attempt.level);
  const answerMap = new Map<string, string>();
  answers.forEach((ans) => {
    if (ans.selectedOptionId) {
      answerMap.set(ans.questionId, ans.selectedOptionId.trim());
    }
  });

  let totalScore = 0;
  const categoryStats: Record<string, { total: number; earned: number }> = {
    QUANTITATIVE: { total: 0, earned: 0 },
    LOGICAL: { total: 0, earned: 0 },
    VERBAL: { total: 0, earned: 0 },
  };

  const topicStats: Record<string, { total: number; earned: number }> = {};
  const questionReviews = [];

  for (const q of questions) {
    const cat = q.category || "QUANTITATIVE";
    categoryStats[cat].total += 1;

    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { total: 0, earned: 0 };
    }
    topicStats[q.topic].total += 1;

    const studentChoice = answerMap.get(q.id);
    const isCorrect = studentChoice === q.correctOptionId;
    const earned = isCorrect ? 1 : 0;

    if (isCorrect) {
      totalScore += 1;
      categoryStats[cat].earned += 1;
      topicStats[q.topic].earned += 1;
    }

    // Persist answer in DB
    await prisma.submissionAnswer.create({
      data: {
        attemptId: attempt.id,
        questionId: q.id,
        selectedOption: studentChoice || null,
        scoreAwarded: earned,
      },
    });

    questionReviews.push({
      id: q.id,
      topic: q.topic,
      category: q.category,
      prompt: q.prompt,
      options: q.options,
      studentSelectedOption: studentChoice || null,
      correctOptionId: q.correctOptionId,
      isCorrect,
      earnedScore: earned,
      solutionExplanation: q.solutionExplanation,
    });
  }

  const totalQuestions = 25;
  const percentage = Math.round((totalScore / totalQuestions) * 100);
  const passed = percentage >= 60;

  const categoryBreakdown: CategoryBreakdown[] = (["QUANTITATIVE", "LOGICAL", "VERBAL"] as const).map(
    (cat) => ({
      category: cat,
      total: categoryStats[cat].total,
      earned: categoryStats[cat].earned,
      percentage: Math.round((categoryStats[cat].earned / categoryStats[cat].total) * 100),
    })
  );

  const weakTopics = Object.entries(topicStats)
    .filter(([_, stats]) => (stats.earned / stats.total) < 0.6)
    .map(([topic]) => topic);

  // Update Attempt record in DB
  const updatedAttempt = await prisma.assessmentAttempt.update({
    where: { id: attempt.id },
    data: {
      score: totalScore,
      passed,
      status,
      submittedAt: now,
    },
  });

  return {
    attemptId: updatedAttempt.id,
    level: updatedAttempt.level,
    score: totalScore,
    totalQuestions,
    percentage,
    passed,
    status: updatedAttempt.status,
    submittedAt: updatedAttempt.submittedAt,
    passingThresholdScore: 15,
    passingThresholdPercent: 60,
    categoryBreakdown,
    weakTopics,
    questionReviews,
  };
}

export async function getAptitudeAttemptResult(userId: string, attemptId: string) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: { answers: true },
  });

  if (!attempt || attempt.userId !== userId) {
    throw new Error("Attempt not found or unauthorized.");
  }

  const questions = getAptitudeQuestions(attempt.level);
  const answersMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  const categoryStats: Record<string, { total: number; earned: number }> = {
    QUANTITATIVE: { total: 0, earned: 0 },
    LOGICAL: { total: 0, earned: 0 },
    VERBAL: { total: 0, earned: 0 },
  };
  const topicStats: Record<string, { total: number; earned: number }> = {};

  const questionReviews = questions.map((q) => {
    const cat = q.category || "QUANTITATIVE";
    categoryStats[cat].total += 1;

    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { total: 0, earned: 0 };
    }
    topicStats[q.topic].total += 1;

    const ans = answersMap.get(q.id);
    const earned = ans?.scoreAwarded || 0;
    const isCorrect = earned > 0;

    if (isCorrect) {
      categoryStats[cat].earned += 1;
      topicStats[q.topic].earned += 1;
    }

    return {
      id: q.id,
      topic: q.topic,
      category: q.category,
      prompt: q.prompt,
      options: q.options,
      studentSelectedOption: ans?.selectedOption || null,
      correctOptionId: q.correctOptionId,
      isCorrect,
      earnedScore: earned,
      solutionExplanation: q.solutionExplanation,
    };
  });

  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);

  const categoryBreakdown: CategoryBreakdown[] = (["QUANTITATIVE", "LOGICAL", "VERBAL"] as const).map(
    (cat) => ({
      category: cat,
      total: categoryStats[cat].total,
      earned: categoryStats[cat].earned,
      percentage: Math.round((categoryStats[cat].earned / categoryStats[cat].total) * 100),
    })
  );

  const weakTopics = Object.entries(topicStats)
    .filter(([_, stats]) => (stats.earned / stats.total) < 0.6)
    .map(([topic]) => topic);

  return {
    attemptId: attempt.id,
    level: attempt.level,
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    percentage,
    passed: attempt.passed,
    status: attempt.status,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    passingThresholdScore: 15,
    passingThresholdPercent: 60,
    categoryBreakdown,
    weakTopics,
    questionReviews,
  };
}
