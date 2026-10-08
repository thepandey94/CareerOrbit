import { describe, it, expect } from "vitest";
import { calculateJobReadiness } from "../src/lib/services/dashboard-service";

describe("Student Dashboard: Job-Readiness Score Calculation", () => {
  it("should calculate composite score using 40% Technical, 30% Aptitude, and 30% Communication when all 3 are present", () => {
    // Tech: 80%, Apt: 70%, Comm: 90%
    // Expected: 80 * 0.4 + 70 * 0.3 + 90 * 0.3 = 32 + 21 + 27 = 80%
    const result = calculateJobReadiness(80, 70, 90);

    expect(result.isComplete).toBe(true);
    expect(result.overallScore).toBe(80);
    expect(result.missingComponents).toHaveLength(0);
    expect(result.readinessTier).toBe("STRONG");
    expect(result.technical.score).toBe(80);
    expect(result.aptitude.score).toBe(70);
    expect(result.communication.score).toBe(90);
  });

  it("CRITICAL RULE: should mark score as incomplete (null) rather than treating missing assessments as zero", () => {
    // Only Technical completed, Aptitude and Communication missing
    const techOnly = calculateJobReadiness(85, null, null);

    expect(techOnly.isComplete).toBe(false);
    expect(techOnly.overallScore).toBeNull(); // Must NOT be 34 (85 * 0.4 + 0 + 0)
    expect(techOnly.missingComponents).toContain("Aptitude Assessment");
    expect(techOnly.missingComponents).toContain("Communication Presentation");
    expect(techOnly.readinessTier).toBe("INCOMPLETE");

    // Tech and Aptitude completed, Communication missing
    const twoCompleted = calculateJobReadiness(80, 75, null);
    expect(twoCompleted.isComplete).toBe(false);
    expect(twoCompleted.overallScore).toBeNull();
    expect(twoCompleted.missingComponents).toEqual(["Communication Presentation"]);
    expect(twoCompleted.readinessTier).toBe("INCOMPLETE");

    // All missing
    const noneCompleted = calculateJobReadiness(null, null, null);
    expect(noneCompleted.isComplete).toBe(false);
    expect(noneCompleted.overallScore).toBeNull();
    expect(noneCompleted.missingComponents).toHaveLength(3);
  });

  it("should assign correct placement tiers based on composite scores", () => {
    // Elite Tier (>= 85)
    const elite = calculateJobReadiness(90, 85, 90); // 36 + 25.5 + 27 = 88.5 -> 89
    expect(elite.overallScore).toBe(89);
    expect(elite.readinessTier).toBe("ELITE");

    // Strong Tier (70 - 84)
    const strong = calculateJobReadiness(75, 70, 75); // 30 + 21 + 22.5 = 73.5 -> 74
    expect(strong.overallScore).toBe(74);
    expect(strong.readinessTier).toBe("STRONG");

    // Benchmark Tier (60 - 69)
    const benchmark = calculateJobReadiness(65, 60, 60); // 26 + 18 + 18 = 62
    expect(benchmark.overallScore).toBe(62);
    expect(benchmark.readinessTier).toBe("BENCHMARK");

    // Revision Required (< 60)
    const revision = calculateJobReadiness(50, 55, 45); // 20 + 16.5 + 13.5 = 50
    expect(revision.overallScore).toBe(50);
    expect(revision.readinessTier).toBe("REVISION_REQUIRED");
  });
});
