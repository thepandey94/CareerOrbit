import { prisma } from "../db";
import {
  getTechnicalQuestions,
  AssessmentQuestion,
} from "../assessments/question-bank";
import { runTestCases, SupportedLanguage } from "../execution/engine";
import { CareerTrackType } from "../onboarding/scoring";

export interface StudentAnswerInput {
  questionId: string;
  selectedOptionId?: string;
  submittedCode?: string;
  language?: "python" | "java";
}

export interface TopicPerformance {
  topic: string;
  total: number;
  earned: number;
  percentage: number;
}

export async function getTechnicalOverview(userId: string) {
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
  });

  const track = (profile?.selectedTrack as CareerTrackType) || "SOFTWARE_ENGINEER";

  const attempts = await prisma.assessmentAttempt.findMany({
    where: {
      userId,
      assessmentType: "TECHNICAL",
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

  // Level 1 status
  const level1Attempts = attempts.filter((a) => a.level === 1);
  const level1Passed = level1Attempts.some((a) => a.passed);

  return {
    track,
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
    levels: [
      {
        level: 1,
        title: "Level 1: Core Foundation & Problem Solving",
        description: "25 Questions: 15 Conceptual, 5 Code Output/Debugging, 5 Coding Problems. 60 Minutes.",
        passed: level1Passed,
        attemptsCount: level1Attempts.length,
        bestScore: level1Attempts.length > 0 ? Math.max(...level1Attempts.map((a) => a.score)) : 0,
      },
    ],
  };
}

export async function startTechnicalAttempt(userId: string, level: number = 1) {
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
  });

  const track = (profile?.selectedTrack as CareerTrackType) || "SOFTWARE_ENGINEER";
  const now = new Date();

  // Check if there is an in-progress active attempt
  const existingAttempt = await prisma.assessmentAttempt.findFirst({
    where: {
      userId,
      assessmentType: "TECHNICAL",
      level,
      status: "IN_PROGRESS",
    },
    orderBy: { startedAt: "desc" },
  });

  let attempt = existingAttempt;

  if (attempt) {
    if (new Date(attempt.expiresAt) <= now) {
      // Past expiration, mark EXPIRED and spawn fresh
      await prisma.assessmentAttempt.update({
        where: { id: attempt.id },
        data: { status: "EXPIRED" },
      });
      attempt = null;
    }
  }

  if (!attempt) {
    // 60-minute duration for 25 questions
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    attempt = await prisma.assessmentAttempt.create({
      data: {
        userId,
        assessmentType: "TECHNICAL",
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

  const rawQuestions = getTechnicalQuestions(track, level);

  // SANITIZE: remove correct answers, solutions, and hidden test cases
  const sanitizedQuestions = rawQuestions.map((q) => ({
    id: q.id,
    topic: q.topic,
    questionType: q.questionType,
    difficulty: q.difficulty,
    prompt: q.prompt,
    codeSnippet: q.codeSnippet,
    options: q.options,
    starterCode: q.starterCode,
    sampleTestCases: (q.testCases || [])
      .filter((tc) => !tc.isHidden)
      .map((tc) => ({
        id: tc.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      })),
  }));

  return {
    attemptId: attempt.id,
    track,
    level: attempt.level,
    totalQuestions: 25,
    startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt,
    durationMinutes: 60,
    passingThresholdPercent: 60,
    passingThresholdScore: 15,
    questions: sanitizedQuestions,
  };
}

/**
 * Runs a code trial against sample test cases only during an active assessment.
 * Hidden test cases are NEVER run or revealed here.
 */
export async function runTrialCode(
  userId: string,
  attemptId: string,
  questionId: string,
  code: string,
  language: SupportedLanguage
) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt || attempt.userId !== userId) {
    throw new Error("Attempt not found or unauthorized.");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("This assessment attempt has already been submitted or expired.");
  }

  if (new Date(attempt.expiresAt) < new Date()) {
    throw new Error("Assessment time has expired.");
  }

  const questions = getTechnicalQuestions("SOFTWARE_ENGINEER", attempt.level);
  const targetQuestion = questions.find((q) => q.id === questionId);

  if (!targetQuestion) {
    throw new Error("Question not found in assessment question bank.");
  }

  const sampleTestCases = (targetQuestion.testCases || []).filter((tc) => !tc.isHidden);

  if (sampleTestCases.length === 0) {
    throw new Error("No sample test cases available for this question.");
  }

  // Execute against sample test cases
  const suiteResult = await runTestCases(code, language, sampleTestCases);

  return {
    questionId,
    language,
    allPassed: suiteResult.allPassed,
    passedTests: suiteResult.passedTests,
    totalTests: suiteResult.totalTests,
    testResults: suiteResult.results,
  };
}

/**
 * Submits and officially grades the technical assessment.
 * Evaluates all 25 questions with equal marks (1 mark each, 0 negative marking).
 * Runs coding questions against both sample and hidden test cases.
 */
export async function submitTechnicalAttempt(
  userId: string,
  attemptId: string,
  answers: StudentAnswerInput[]
) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: { answers: true },
  });

  if (!attempt || attempt.userId !== userId) {
    throw new Error("Attempt not found or unauthorized.");
  }

  if (attempt.status === "SUBMITTED") {
    // Already graded, return past result
    return getTechnicalAttemptResult(userId, attemptId);
  }

  const now = new Date();
  const isTimeExpired = new Date(attempt.expiresAt) < now;
  const status = isTimeExpired ? "EXPIRED" : "SUBMITTED";

  const questions = getTechnicalQuestions("SOFTWARE_ENGINEER", attempt.level);
  const answerMap = new Map<string, StudentAnswerInput>();
  answers.forEach((ans) => answerMap.set(ans.questionId, ans));

  let totalScore = 0;
  const topicStats: Record<string, { total: number; earned: number }> = {};
  const questionReviews = [];

  // Evaluate each of the 25 questions
  for (const q of questions) {
    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { total: 0, earned: 0 };
    }
    topicStats[q.topic].total += 1;

    const studentAnswer = answerMap.get(q.id);
    let isCorrect = false;
    let earned = 0;
    let passedTests = 0;
    let totalTests = 0;
    let execStatus: string | null = null;

    if (q.questionType === "CODING_PROBLEM") {
      const code = studentAnswer?.submittedCode?.trim() || "";
      const lang = studentAnswer?.language || "python";

      if (code && q.testCases && q.testCases.length > 0) {
        totalTests = q.testCases.length;
        const testResult = await runTestCases(code, lang, q.testCases);
        passedTests = testResult.passedTests;

        // Equal mark: 1 point if all test cases pass
        if (testResult.allPassed) {
          isCorrect = true;
          earned = 1;
          execStatus = "ALL_TESTS_PASSED";
        } else {
          isCorrect = false;
          earned = 0;
          execStatus = `${passedTests}/${totalTests}_TESTS_PASSED`;
        }
      }
    } else {
      // Conceptual, Code Output, Debugging: multiple-choice check
      const selected = studentAnswer?.selectedOptionId?.trim();
      if (selected && selected === q.correctOptionId) {
        isCorrect = true;
        earned = 1;
      }
    }

    if (isCorrect) {
      totalScore += earned;
      topicStats[q.topic].earned += earned;
    }

    // Upsert SubmissionAnswer
    await prisma.submissionAnswer.create({
      data: {
        attemptId: attempt.id,
        questionId: q.id,
        selectedOption: studentAnswer?.selectedOptionId || null,
        submittedCode: studentAnswer?.submittedCode || null,
        language: studentAnswer?.language || null,
        passedTests,
        totalTests,
        executionStatus: execStatus,
        scoreAwarded: earned,
      },
    });

    questionReviews.push({
      id: q.id,
      topic: q.topic,
      questionType: q.questionType,
      prompt: q.prompt,
      codeSnippet: q.codeSnippet,
      options: q.options,
      studentSelectedOption: studentAnswer?.selectedOptionId || null,
      correctOptionId: q.correctOptionId,
      submittedCode: studentAnswer?.submittedCode || null,
      isCorrect,
      earnedScore: earned,
      solutionExplanation: q.solutionExplanation,
    });
  }

  const totalQuestions = questions.length; // 25
  const percentage = Math.round((totalScore / totalQuestions) * 100);
  const passed = percentage >= 60; // 60% passing threshold

  // Topic-level breakdown & weak-topic detection
  const topicBreakdown: TopicPerformance[] = Object.entries(topicStats).map(([topic, stats]) => ({
    topic,
    total: stats.total,
    earned: stats.earned,
    percentage: Math.round((stats.earned / stats.total) * 100),
  }));

  const weakTopics = topicBreakdown
    .filter((t) => t.percentage < 60)
    .map((t) => t.topic);

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
    topicBreakdown,
    weakTopics,
    questionReviews,
  };
}

export async function getTechnicalAttemptResult(userId: string, attemptId: string) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: { answers: true },
  });

  if (!attempt || attempt.userId !== userId) {
    throw new Error("Attempt not found or unauthorized.");
  }

  const questions = getTechnicalQuestions("SOFTWARE_ENGINEER", attempt.level);
  const answersMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  const topicStats: Record<string, { total: number; earned: number }> = {};
  const questionReviews = questions.map((q) => {
    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { total: 0, earned: 0 };
    }
    topicStats[q.topic].total += 1;

    const ans = answersMap.get(q.id);
    const earned = ans?.scoreAwarded || 0;
    topicStats[q.topic].earned += earned;

    const isCorrect = earned > 0;

    return {
      id: q.id,
      topic: q.topic,
      questionType: q.questionType,
      prompt: q.prompt,
      codeSnippet: q.codeSnippet,
      options: q.options,
      studentSelectedOption: ans?.selectedOption || null,
      correctOptionId: q.correctOptionId,
      submittedCode: ans?.submittedCode || null,
      isCorrect,
      earnedScore: earned,
      solutionExplanation: q.solutionExplanation,
    };
  });

  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);

  const topicBreakdown: TopicPerformance[] = Object.entries(topicStats).map(([topic, stats]) => ({
    topic,
    total: stats.total,
    earned: stats.earned,
    percentage: Math.round((stats.earned / stats.total) * 100),
  }));

  const weakTopics = topicBreakdown
    .filter((t) => t.percentage < 60)
    .map((t) => t.topic);

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
    topicBreakdown,
    weakTopics,
    questionReviews,
  };
}
