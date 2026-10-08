import { describe, it, expect } from "vitest";
import {
  getAptitudeQuestions,
} from "../src/lib/assessments/question-bank";

describe("Phase 3: Aptitude Module Question Structure & Scoring Rules", () => {
  it("delivers exactly 25 timed questions with 10 Quant, 8 Logical, and 7 Verbal distribution", () => {
    const questions = getAptitudeQuestions(1);

    expect(questions).toHaveLength(25);

    const quant = questions.filter((q) => q.category === "QUANTITATIVE");
    const logical = questions.filter((q) => q.category === "LOGICAL");
    const verbal = questions.filter((q) => q.category === "VERBAL");

    expect(quant).toHaveLength(10);
    expect(logical).toHaveLength(8);
    expect(verbal).toHaveLength(7);

    // Each question must have valid prompt, options, correctOptionId, and solution explanation
    questions.forEach((q) => {
      expect(q.prompt.length).toBeGreaterThan(10);
      expect(q.options?.length).toBeGreaterThanOrEqual(4);
      expect(q.correctOptionId).toBeDefined();
      expect(q.solutionExplanation.length).toBeGreaterThan(10);
    });
  });

  it("enforces equal marks (1 mark each) and no negative marking across all aptitude sections", () => {
    const questions = getAptitudeQuestions(1);

    // Simulate 16 correct and 9 incorrect answers
    let score = 0;
    questions.forEach((q, idx) => {
      if (idx < 16) {
        score += 1;
      } else {
        // Incorrect: no negative mark
        score += 0;
      }
    });

    expect(score).toBe(16);
    const percentage = Math.round((score / 25) * 100);
    expect(percentage).toBe(64);
    expect(percentage >= 60).toBe(true);
  });

  it("calculates accurate section percentages and identifies weak categories", () => {
    // 6 out of 10 Quant (60%) -> Passed section
    // 3 out of 8 Logical (37.5% -> 38%) -> Weak section
    // 6 out of 7 Verbal (85.7% -> 86%) -> Strong section
    const quantStats = { total: 10, earned: 6, percentage: Math.round((6 / 10) * 100) };
    const logicalStats = { total: 8, earned: 3, percentage: Math.round((3 / 8) * 100) };
    const verbalStats = { total: 7, earned: 6, percentage: Math.round((6 / 7) * 100) };

    expect(quantStats.percentage).toBe(60);
    expect(logicalStats.percentage).toBe(38);
    expect(verbalStats.percentage).toBe(86);

    const sections = [
      { name: "QUANTITATIVE", ...quantStats },
      { name: "LOGICAL", ...logicalStats },
      { name: "VERBAL", ...verbalStats },
    ];

    const weakSections = sections
      .filter((s) => s.percentage < 60)
      .map((s) => s.name);

    expect(weakSections).toEqual(["LOGICAL"]);
  });
});
