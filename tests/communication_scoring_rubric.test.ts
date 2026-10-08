import { describe, it, expect } from "vitest";
import {
  calculateNormalizedOverallScore,
  PASSING_SCORE_THRESHOLD,
} from "../src/lib/communication/rubric";

describe("Communication Scoring Rubric & Normalization", () => {
  it("should weight all 5 categories equally at 20 points each when visual delivery is reliable", () => {
    const result = calculateNormalizedOverallScore({
      contentRaw: 18,
      clarityRaw: 16,
      grammarRaw: 17,
      paceRaw: 15,
      visualDeliveryRaw: 14,
      visualDeliveryReliable: true,
    });

    expect(result.visualDeliveryExcluded).toBe(false);
    expect(result.overallScore).toBe(18 + 16 + 17 + 15 + 14); // 80 / 100
    expect(result.passed).toBe(true);
  });

  it("should normalize over 4 categories when visual delivery is excluded/unreliable", () => {
    // 4 categories with 16 each = 64 / 80 => (64 / 80) * 100 = 80
    const result = calculateNormalizedOverallScore({
      contentRaw: 16,
      clarityRaw: 16,
      grammarRaw: 16,
      paceRaw: 16,
      visualDeliveryRaw: 0,
      visualDeliveryReliable: false,
    });

    expect(result.visualDeliveryExcluded).toBe(true);
    expect(result.overallScore).toBe(80);
    expect(result.passed).toBe(true);
  });

  it("should strictly enforce the 60% passing threshold", () => {
    // 5 categories total = 59 / 100 -> Failed
    const failResult = calculateNormalizedOverallScore({
      contentRaw: 12,
      clarityRaw: 12,
      grammarRaw: 12,
      paceRaw: 12,
      visualDeliveryRaw: 11,
      visualDeliveryReliable: true,
    });
    expect(failResult.overallScore).toBe(59);
    expect(failResult.passed).toBe(false);

    // 5 categories total = 60 / 100 -> Passed
    const passResult = calculateNormalizedOverallScore({
      contentRaw: 12,
      clarityRaw: 12,
      grammarRaw: 12,
      paceRaw: 12,
      visualDeliveryRaw: 12,
      visualDeliveryReliable: true,
    });
    expect(passResult.overallScore).toBe(60);
    expect(passResult.passed).toBe(true);
    expect(PASSING_SCORE_THRESHOLD).toBe(60);
  });

  it("should clamp category scores between 0 and 20 and overall score between 0 and 100", () => {
    const clampedHigh = calculateNormalizedOverallScore({
      contentRaw: 25, // over max
      clarityRaw: 30,
      grammarRaw: 22,
      paceRaw: 21,
      visualDeliveryRaw: 24,
      visualDeliveryReliable: true,
    });
    expect(clampedHigh.overallScore).toBe(100);

    const clampedLow = calculateNormalizedOverallScore({
      contentRaw: -5,
      clarityRaw: -2,
      grammarRaw: 0,
      paceRaw: 0,
      visualDeliveryRaw: 0,
      visualDeliveryReliable: true,
    });
    expect(clampedLow.overallScore).toBe(0);
    expect(clampedLow.passed).toBe(false);
  });
});
