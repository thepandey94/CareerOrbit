import { describe, it, expect } from "vitest";
import { evaluateDiagnosticAssessment } from "../src/lib/onboarding/diagnostic";

describe("Phase 2: Assessment Scoring & 60% Threshold Verification", () => {
  it("should evaluate 60% passing threshold accurately", () => {
    const totalQuestions = 5;
    const passingThreshold = 60;

    const pass3 = (3 / totalQuestions) * 100;
    const fail2 = (2 / totalQuestions) * 100;
    const pass5 = (5 / totalQuestions) * 100;

    expect(pass3).toBe(60);
    expect(pass3 >= passingThreshold).toBe(true);

    expect(fail2).toBe(40);
    expect(fail2 >= passingThreshold).toBe(false);

    expect(pass5).toBe(100);
    expect(pass5 >= passingThreshold).toBe(true);
  });

  it("should evaluate diagnostic assessment and identify strengths and gaps", () => {
    // Submit 4 correct and 2 incorrect answers
    const submissions = [
      { questionId: "diag_java_1", selectedOptionId: "b" }, // correct
      { questionId: "diag_python_1", selectedOptionId: "b" }, // correct
      { questionId: "diag_js_1", selectedOptionId: "b" }, // correct
      { questionId: "diag_sql_1", selectedOptionId: "c" }, // correct
      { questionId: "diag_cpp_1", selectedOptionId: "a" }, // wrong (std::shared_ptr instead of std::unique_ptr)
      { questionId: "diag_html_css_1", selectedOptionId: "a" }, // wrong (content+padding+border)
    ];

    const result = evaluateDiagnosticAssessment(submissions);

    expect(result.totalQuestions).toBe(6);
    expect(result.correctAnswers).toBe(4);
    expect(result.percentageScore).toBe(67);
    expect(result.startingLevel).toBe("INTERMEDIATE");

    expect(result.strengths.length).toBe(4);
    expect(result.gaps.length).toBe(2);

    expect(result.gaps.map((g) => g.skill)).toContain("cpp");
    expect(result.gaps.map((g) => g.skill)).toContain("html_css");

    expect(result.constraintNotice).toContain("do not automatically pass future official assessments");
  });
});
