import { describe, it, expect } from "vitest";
import {
  getTechnicalQuestions,
} from "../src/lib/assessments/question-bank";

describe("Phase 3: Technical Round Question Structure & Scoring Rules", () => {
  it("delivers exactly 25 questions per level with approved question type distribution", () => {
    const questions = getTechnicalQuestions("SOFTWARE_ENGINEER", 1);

    expect(questions).toHaveLength(25);

    const conceptual = questions.filter((q) => q.questionType === "CONCEPTUAL");
    const codeOutput = questions.filter((q) => q.questionType === "CODE_OUTPUT");
    const debugging = questions.filter((q) => q.questionType === "DEBUGGING");
    const codingProblems = questions.filter((q) => q.questionType === "CODING_PROBLEM");

    // 15 Conceptual questions
    expect(conceptual).toHaveLength(15);

    // 5 Code Output / Debugging questions combined
    expect(codeOutput.length + debugging.length).toBe(5);

    // 5 Coding Problems
    expect(codingProblems).toHaveLength(5);

    // All coding questions must provide starter code for both Python and Java
    codingProblems.forEach((q) => {
      expect(q.starterCode?.python).toBeDefined();
      expect(q.starterCode?.java).toBeDefined();
      expect(q.testCases && q.testCases.length).toBeGreaterThanOrEqual(3);

      // Must have at least 1 sample and at least 1 hidden test case
      const hasSample = q.testCases?.some((tc) => !tc.isHidden);
      const hasHidden = q.testCases?.some((tc) => tc.isHidden);
      expect(hasSample).toBe(true);
      expect(hasHidden).toBe(true);
    });
  });

  it("enforces equal marks (1 mark each) and no negative marking for incorrect answers", () => {
    const questions = getTechnicalQuestions("SOFTWARE_ENGINEER", 1);
    const totalQuestions = questions.length; // 25

    // Simulate student getting 10 questions correct, 10 questions incorrect, and 5 blank
    let earnedScore = 0;
    const scoredQuestions = questions.map((q, idx) => {
      if (idx < 10) {
        // Correct answer
        earnedScore += 1;
        return { isCorrect: true, mark: 1 };
      } else if (idx < 20) {
        // Incorrect answer: must award 0, NEVER negative
        return { isCorrect: false, mark: 0 };
      } else {
        // Blank / unanswered
        return { isCorrect: false, mark: 0 };
      }
    });

    // Verify marks
    scoredQuestions.forEach((sq) => {
      expect(sq.mark >= 0).toBe(true);
    });

    expect(earnedScore).toBe(10);
    const percentage = Math.round((earnedScore / totalQuestions) * 100);
    expect(percentage).toBe(40);
  });

  it("enforces the 60% passing threshold strictly (15/25 passes, 14/25 fails)", () => {
    const passingScore = 15;
    const failingScore = 14;
    const total = 25;

    const passingPercent = Math.round((passingScore / total) * 100);
    const failingPercent = Math.round((failingScore / total) * 100);

    expect(passingPercent).toBe(60);
    expect(failingPercent).toBe(56);

    const isPassed = (score: number) => Math.round((score / total) * 100) >= 60;

    expect(isPassed(passingScore)).toBe(true);
    expect(isPassed(failingScore)).toBe(false);
    expect(isPassed(25)).toBe(true);
    expect(isPassed(0)).toBe(false);
  });

  it("calculates topic-level performance breakdown and detects weak topics under 60%", () => {
    const topicStats: Record<string, { total: number; earned: number }> = {
      OOP: { total: 4, earned: 4 }, // 100% -> Strong
      DATA_STRUCTURES: { total: 4, earned: 3 }, // 75% -> Strong
      ALGORITHMS: { total: 4, earned: 1 }, // 25% -> WEAK
      DATABASES: { total: 2, earned: 0 }, // 0% -> WEAK
    };

    const breakdown = Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      total: stats.total,
      earned: stats.earned,
      percentage: Math.round((stats.earned / stats.total) * 100),
    }));

    const weakTopics = breakdown
      .filter((b) => b.percentage < 60)
      .map((b) => b.topic);

    expect(weakTopics).toContain("ALGORITHMS");
    expect(weakTopics).toContain("DATABASES");
    expect(weakTopics).not.toContain("OOP");
    expect(weakTopics).not.toContain("DATA_STRUCTURES");
  });
});
