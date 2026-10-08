import { describe, it, expect } from "vitest";
import { calculateCareerCompatibility } from "../src/lib/onboarding/scoring";

describe("Phase 2: Career Compatibility Scoring Engine", () => {
  it("should calculate high Software Engineer compatibility when engineering options are selected", () => {
    const answers = [
      { questionId: "preferred_activity", optionId: "opt_eng" },
      { questionId: "problem_solving_style", optionId: "opt_eng_prob" },
      { questionId: "tech_interest", optionId: "opt_eng_tech" },
      { questionId: "project_pride", optionId: "opt_eng_proj" },
      { questionId: "learning_goal", optionId: "opt_eng_goal" },
      { questionId: "curiosity_trigger", optionId: "opt_eng_cur" },
    ];

    const skillRatings = {
      java: 4,
      python: 4,
      cpp: 4,
      sql: 3,
      javascript: 1,
      html_css: 1,
    };

    const result = calculateCareerCompatibility(answers, skillRatings);

    expect(result.recommendedTrack).toBe("SOFTWARE_ENGINEER");
    expect(result.scores.SOFTWARE_ENGINEER).toBeGreaterThanOrEqual(80);
    expect(result.scores.SOFTWARE_ENGINEER).toBeGreaterThan(result.scores.WEB_DEVELOPER);
    expect(result.scores.SOFTWARE_ENGINEER).toBeGreaterThan(result.scores.DATA_ANALYST);
    expect(result.breakdowns.SOFTWARE_ENGINEER.recommendationLevel).toBe("STRONG_MATCH");
    expect(result.breakdowns.SOFTWARE_ENGINEER.contributingFactors.length).toBeGreaterThan(0);
  });

  it("should calculate high Web Developer compatibility when web design options are selected", () => {
    const answers = [
      { questionId: "preferred_activity", optionId: "opt_web" },
      { questionId: "problem_solving_style", optionId: "opt_web_prob" },
      { questionId: "tech_interest", optionId: "opt_web_tech" },
      { questionId: "project_pride", optionId: "opt_web_proj" },
      { questionId: "learning_goal", optionId: "opt_web_goal" },
      { questionId: "curiosity_trigger", optionId: "opt_web_cur" },
    ];

    const skillRatings = {
      javascript: 5,
      html_css: 5,
      java: 1,
      python: 1,
      cpp: 1,
      sql: 1,
    };

    const result = calculateCareerCompatibility(answers, skillRatings);

    expect(result.recommendedTrack).toBe("WEB_DEVELOPER");
    expect(result.scores.WEB_DEVELOPER).toBeGreaterThan(result.scores.SOFTWARE_ENGINEER);
    expect(result.scores.WEB_DEVELOPER).toBeGreaterThan(result.scores.DATA_ANALYST);
    expect(result.breakdowns.WEB_DEVELOPER.recommendationLevel).toBe("STRONG_MATCH");
  });

  it("should calculate high Data Analyst compatibility when data options are selected", () => {
    const answers = [
      { questionId: "preferred_activity", optionId: "opt_data" },
      { questionId: "problem_solving_style", optionId: "opt_data_prob" },
      { questionId: "tech_interest", optionId: "opt_data_tech" },
      { questionId: "project_pride", optionId: "opt_data_proj" },
      { questionId: "learning_goal", optionId: "opt_data_goal" },
      { questionId: "curiosity_trigger", optionId: "opt_data_cur" },
    ];

    const skillRatings = {
      sql: 5,
      python: 4,
      java: 1,
      cpp: 1,
      javascript: 1,
      html_css: 1,
    };

    const result = calculateCareerCompatibility(answers, skillRatings);

    expect(result.recommendedTrack).toBe("DATA_ANALYST");
    expect(result.scores.DATA_ANALYST).toBeGreaterThan(result.scores.SOFTWARE_ENGINEER);
    expect(result.scores.DATA_ANALYST).toBeGreaterThan(result.scores.WEB_DEVELOPER);
  });

  it("should enforce transparent score bounds between 0 and 100", () => {
    // Empty answers and minimal ratings
    const result = calculateCareerCompatibility([], {
      java: 1,
      python: 1,
      cpp: 1,
      sql: 1,
      javascript: 1,
      html_css: 1,
    });

    for (const track of ["SOFTWARE_ENGINEER", "WEB_DEVELOPER", "DATA_ANALYST"] as const) {
      expect(result.scores[track]).toBeGreaterThanOrEqual(0);
      expect(result.scores[track]).toBeLessThanOrEqual(100);
      expect(result.breakdowns[track].questionnairePoints).toBeLessThanOrEqual(60);
      expect(result.breakdowns[track].skillPoints).toBeLessThanOrEqual(40);
    }
  });

  it("should include guidance disclaimer clarifying that low scores do not block career selection", () => {
    const result = calculateCareerCompatibility([], {});
    expect(result.guidanceDisclaimer).toContain("not a barrier");
    expect(result.guidanceDisclaimer).toContain("never prevent you from choosing any career track");
  });
});
