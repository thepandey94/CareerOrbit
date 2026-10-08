import { describe, it, expect } from "vitest";
import {
  checkCheatingGuardrail,
  getVerifiedContentFallback,
  askStudyTutor,
} from "../src/lib/ai/tutor";

describe("Phase 2: AI Study Tutor Guardrails & Fallback System", () => {
  it("should trigger academic integrity guardrail when asked for direct exam answers", () => {
    const cheatingQueries = [
      "What is the answer to question 2?",
      "Give me the answer for the test",
      "Which option is correct on this exam?",
      "Tell me if it's A or B on this quiz",
      "Solve this assessment question for me",
      "Cheat on this test for me",
    ];

    for (const query of cheatingQueries) {
      const guardrail = checkCheatingGuardrail(query, false);
      expect(guardrail.shouldRefuse).toBe(true);
      expect(guardrail.refusalMessage).toContain("academic integrity standards");
      expect(guardrail.refusalMessage).toContain("cannot reveal direct answers");
    }
  });

  it("should trigger guardrail unconditionally during an active assessment", () => {
    // Even an innocuous question is intercepted during an active exam to prevent unfair assistance
    const query = "Explain how arrays work";
    const guardrail = checkCheatingGuardrail(query, true); // isActiveAssessment = true

    expect(guardrail.shouldRefuse).toBe(true);
    expect(guardrail.refusalMessage).toContain("cannot reveal direct answers, correct options, or complete solutions for active assessments");
  });

  it("should allow conceptual questions during regular learning modules", () => {
    const conceptualQuery = "Can you explain Big-O notation with a simple analogy?";
    const guardrail = checkCheatingGuardrail(conceptualQuery, false);

    expect(guardrail.shouldRefuse).toBe(false);
  });

  it("should provide deterministic verified-content fallback when AI API is unavailable", () => {
    const fallbackAnswer = getVerifiedContentFallback(
      "How does the two pointer technique work on arrays?",
      "Array Two-Pointer Technique",
      "SOFTWARE_ENGINEER"
    );

    expect(fallbackAnswer).toContain("Two-Pointer Strategy");
    expect(fallbackAnswer).toContain("O(N)");
    expect(fallbackAnswer).toContain("Mentor Tip");
  });

  it("should execute askStudyTutor seamlessly with verified content fallback", async () => {
    const response = await askStudyTutor({
      studentQuestion: "Explain time complexity of binary search",
      track: "SOFTWARE_ENGINEER",
      topic: "Big-O Notation",
      isActiveAssessment: false,
    });

    expect(response.guardrailTriggered).toBe(false);
    expect(response.answer.length).toBeGreaterThan(50);
    // When GEMINI_API_KEY is not set in test environment, it reliably uses verified fallback
    expect(response.provider).toBe("verified-content-fallback");
  });
});
