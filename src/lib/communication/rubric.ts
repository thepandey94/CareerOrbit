export interface CategoryScore {
  rawScore: number; // 0 - 20
  maxScore: number; // 20
  percentage: number; // 0 - 100
  reliable: boolean; // false if audio-only or visual feed degraded
  feedbackNotes: string[];
}

export interface CommunicationEvaluationRubric {
  content: CategoryScore; // Content & Structure
  clarity: CategoryScore; // Clarity & Vocabulary
  grammar: CategoryScore; // Grammar & Syntax
  pace: CategoryScore; // Pace & Filler Words
  visualDelivery: CategoryScore; // Visual Delivery (only when reliable)
  overallScore: number; // 0 - 100
  passed: boolean; // >= 60
  visualDeliveryExcluded: boolean; // true if normalized over 4 categories
  speakingMetrics: {
    durationSeconds: number;
    wordCount: number;
    wordsPerMinute: number;
    wpmAssessment: "TOO_SLOW" | "OPTIMAL" | "ACCEPTABLE" | "TOO_FAST";
    totalFillerWords: number;
    fillerWordDensityPercent: number; // (fillerCount / wordCount) * 100
    fillerWordsDetected: Record<string, number>;
  };
  strengths: string[];
  improvements: string[];
  transcript?: string;
  evaluatedBy: "gemini-2.5-flash" | "heuristic-speech-analyzer";
  ethicalSafeguardsApplied: {
    accentNeutralityEnforced: boolean;
    appearanceNeutralityEnforced: boolean;
    pseudoscienceExcluded: boolean; // No micro-expression / lie detection
  };
}

export const PASSING_SCORE_THRESHOLD = 60; // 60% passing mark

/**
 * Calculates the overall score normalized according to whether visual delivery
 * was evaluated reliably.
 *
 * - When all 5 categories are reliable: Each category is weighted equally at 20 points (total 100).
 * - When visual delivery is unreliable or excluded: The remaining 4 categories (max 80 points total)
 *   are normalized to a 100-point scale: Math.round(((content + clarity + grammar + pace) / 80) * 100).
 */
export function calculateNormalizedOverallScore(params: {
  contentRaw: number; // 0 - 20
  clarityRaw: number; // 0 - 20
  grammarRaw: number; // 0 - 20
  paceRaw: number; // 0 - 20
  visualDeliveryRaw?: number; // 0 - 20
  visualDeliveryReliable: boolean;
}): { overallScore: number; passed: boolean; visualDeliveryExcluded: boolean } {
  const clamp20 = (val: number) => Math.max(0, Math.min(20, Math.round(val)));

  const c = clamp20(params.contentRaw);
  const cl = clamp20(params.clarityRaw);
  const g = clamp20(params.grammarRaw);
  const p = clamp20(params.paceRaw);

  if (params.visualDeliveryReliable && params.visualDeliveryRaw !== undefined) {
    const v = clamp20(params.visualDeliveryRaw);
    const sum = c + cl + g + p + v;
    const overallScore = Math.max(0, Math.min(100, sum));
    return {
      overallScore,
      passed: overallScore >= PASSING_SCORE_THRESHOLD,
      visualDeliveryExcluded: false,
    };
  }

  // Visual delivery excluded: normalize remaining 4 categories (max 80) to 100
  const subtotal = c + cl + g + p;
  const normalized = Math.round((subtotal / 80) * 100);
  const overallScore = Math.max(0, Math.min(100, normalized));

  return {
    overallScore,
    passed: overallScore >= PASSING_SCORE_THRESHOLD,
    visualDeliveryExcluded: true,
  };
}

/**
 * Standard ethical guidelines prompt to include in any AI multimodal instructions
 * to strictly prevent appearance, accent, or pseudo-scientific biases.
 */
export const ETHICAL_EVALUATION_DIRECTIVE = `
CRITICAL ETHICAL EVALUATION DIRECTIVES (NON-NEGOTIABLE):
1. ACCENT & DIALECT NEUTRALITY: Never penalize ethnic, regional, national, or foreign accents. Prioritize technical clarity, precision of terminology, and communicative effectiveness.
2. APPEARANCE & HARDWARE NEUTRALITY: Do not penalize skin tone, age, gender, facial structure, clothing, background environment, lighting conditions, or low-resolution webcam artifacts.
3. EXCLUDE PSEUDOSCIENCE: Absolutely forbid emotional micro-expression analysis, lie detection, cognitive stress inferences, or personality profiling.
4. RELIABILITY CHECK: If video lighting, camera angle, or frame rate makes visual delivery assessment unreliable, explicitly mark visualDelivery as unreliable and evaluate solely on speech and technical content.
5. CONSTRUCTIVE & ENCOURAGING TONE: Give concrete, empowering recommendations suitable for college students entering tech.
`;
