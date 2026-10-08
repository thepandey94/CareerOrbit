export interface SpeakingMetrics {
  durationSeconds: number;
  wordCount: number;
  wordsPerMinute: number;
  wpmAssessment: "TOO_SLOW" | "OPTIMAL" | "ACCEPTABLE" | "TOO_FAST";
  totalFillerWords: number;
  fillerWordDensityPercent: number;
  fillerWordsDetected: Record<string, number>;
}

// Common conversational speech filler patterns (case-insensitive with word boundaries)
const FILLER_PATTERNS: Array<{ word: string; regex: RegExp }> = [
  { word: "um", regex: /\b(um+)\b/gi },
  { word: "uh", regex: /\b(uh+)\b/gi },
  { word: "er", regex: /\b(er+)\b/gi },
  { word: "ah", regex: /\b(ah+)\b/gi },
  { word: "like", regex: /\b(like)\b/gi },
  { word: "you know", regex: /\b(you\s+know)\b/gi },
  { word: "basically", regex: /\b(basically)\b/gi },
  { word: "actually", regex: /\b(actually)\b/gi },
  { word: "literally", regex: /\b(literally)\b/gi },
  { word: "sort of", regex: /\b(sort\s+of)\b/gi },
  { word: "kind of", regex: /\b(kind\s+of)\b/gi },
  { word: "i mean", regex: /\b(i\s+mean)\b/gi },
];

/**
 * Calculates quantitative speaking metrics (WPM, filler word count, density).
 */
export function calculateSpeakingMetrics(
  transcript: string,
  durationSeconds: number
): SpeakingMetrics {
  const safeDuration = Math.max(1, durationSeconds);
  const words = transcript
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const wordCount = words.length;

  // Words per minute (WPM)
  const durationMinutes = safeDuration / 60;
  const wordsPerMinute = Math.round(wordCount / durationMinutes);

  let wpmAssessment: "TOO_SLOW" | "OPTIMAL" | "ACCEPTABLE" | "TOO_FAST";
  if (wordsPerMinute < 105) {
    wpmAssessment = "TOO_SLOW";
  } else if (wordsPerMinute <= 165) {
    wpmAssessment = "OPTIMAL";
  } else if (wordsPerMinute <= 190) {
    wpmAssessment = "ACCEPTABLE";
  } else {
    wpmAssessment = "TOO_FAST";
  }

  // Count filler words
  const fillerWordsDetected: Record<string, number> = {};
  let totalFillerWords = 0;

  for (const { word, regex } of FILLER_PATTERNS) {
    const matches = transcript.match(regex);
    if (matches && matches.length > 0) {
      fillerWordsDetected[word] = matches.length;
      totalFillerWords += matches.length;
    }
  }

  const fillerWordDensityPercent =
    wordCount > 0 ? Number(((totalFillerWords / wordCount) * 100).toFixed(1)) : 0;

  return {
    durationSeconds: safeDuration,
    wordCount,
    wordsPerMinute,
    wpmAssessment,
    totalFillerWords,
    fillerWordDensityPercent,
    fillerWordsDetected,
  };
}

/**
 * Computes the Pace & Filler Words category score (0 - 20) from speaking metrics.
 */
export function scorePaceAndFillers(metrics: SpeakingMetrics): {
  score: number;
  notes: string[];
} {
  const notes: string[] = [];
  let pacePoints = 0;

  // Pace Points (0 - 10)
  if (metrics.wordsPerMinute === 0) {
    pacePoints = 0;
    notes.push("No speech detected during the presentation duration.");
  } else if (metrics.wordsPerMinute >= 115 && metrics.wordsPerMinute <= 165) {
    pacePoints = 10;
    notes.push(`Optimal speaking pace at ${metrics.wordsPerMinute} WPM. Excellent cadence that allows listeners to digest technical points.`);
  } else if (
    (metrics.wordsPerMinute >= 95 && metrics.wordsPerMinute < 115) ||
    (metrics.wordsPerMinute > 165 && metrics.wordsPerMinute <= 185)
  ) {
    pacePoints = 8;
    if (metrics.wordsPerMinute < 115) {
      notes.push(`Speaking pace of ${metrics.wordsPerMinute} WPM is slightly deliberate. Consider picking up tempo during introductory sections.`);
    } else {
      notes.push(`Speaking pace of ${metrics.wordsPerMinute} WPM is slightly fast. Take strategic 1-2 second pauses between major technical concepts.`);
    }
  } else if (metrics.wordsPerMinute < 95) {
    pacePoints = 5;
    notes.push(`Speaking pace of ${metrics.wordsPerMinute} WPM was too slow, which may risk losing audience engagement.`);
  } else {
    pacePoints = 5;
    notes.push(`Speaking pace of ${metrics.wordsPerMinute} WPM was too rapid. The audience may struggle to absorb complex trade-offs.`);
  }

  // Filler Points (0 - 10)
  let fillerPoints = 0;
  if (metrics.wordCount === 0) {
    fillerPoints = 0;
  } else if (metrics.fillerWordDensityPercent < 1.5) {
    fillerPoints = 10;
    notes.push(`Exceptional speech fluency with minimal verbal fillers (${metrics.totalFillerWords} detected, ${metrics.fillerWordDensityPercent}% density).`);
  } else if (metrics.fillerWordDensityPercent <= 3.0) {
    fillerPoints = 8;
    notes.push(`Good verbal control (${metrics.totalFillerWords} fillers detected, ${metrics.fillerWordDensityPercent}% density). Minor natural fillers.`);
  } else if (metrics.fillerWordDensityPercent <= 5.5) {
    fillerPoints = 6;
    notes.push(`Moderate filler word usage (${metrics.totalFillerWords} fillers detected). Notice instances of ${Object.keys(metrics.fillerWordsDetected).slice(0, 3).join(", ")}.`);
  } else {
    fillerPoints = 3;
    notes.push(`High concentration of verbal crutches (${metrics.totalFillerWords} fillers, ${metrics.fillerWordDensityPercent}% density). Try pausing in silence instead of using fillers.`);
  }

  const score = Math.max(0, Math.min(20, pacePoints + fillerPoints));
  return { score, notes };
}

/**
 * Evaluates speech transcript for technical clarity, vocabulary richness,
 * and grammar when running the deterministic heuristic evaluator.
 */
export function analyzeClarityAndGrammar(transcript: string): {
  clarityScore: number;
  clarityNotes: string[];
  grammarScore: number;
  grammarNotes: string[];
} {
  const words = transcript.toLowerCase().match(/\b[a-z0-9_-]+\b/g) || [];
  const uniqueWords = new Set(words);
  const totalWords = words.length;

  if (totalWords < 20) {
    return {
      clarityScore: 4,
      clarityNotes: ["Transcript too brief to demonstrate technical vocabulary and conceptual clarity."],
      grammarScore: 5,
      grammarNotes: ["Insufficient sentence depth to evaluate grammar."],
    };
  }

  // Lexical Diversity (Type-Token Ratio)
  const lexicalRatio = uniqueWords.size / totalWords;
  let clarityScore = 12;
  const clarityNotes: string[] = [];

  if (lexicalRatio > 0.45) {
    clarityScore += 5;
    clarityNotes.push("Strong vocabulary variety and articulate phrasing across concepts.");
  } else if (lexicalRatio > 0.35) {
    clarityScore += 3;
    clarityNotes.push("Solid vocabulary baseline with clear explanatory phrasing.");
  } else {
    clarityScore += 1;
    clarityNotes.push("Frequent repetitive terminology. Expand phrasing when describing architectural components.");
  }

  // Check technical engineering terms
  const technicalTerms = [
    "latency", "throughput", "scalable", "architecture", "tradeoff", "trade-off",
    "cache", "caching", "database", "query", "index", "performance", "optimization",
    "security", "consistency", "distributed", "protocol", "endpoint", "overhead",
    "monolith", "microservice", "component", "interface", "payload", "pipeline"
  ];
  const detectedTechTerms = technicalTerms.filter((term) =>
    transcript.toLowerCase().includes(term)
  );

  if (detectedTechTerms.length >= 5) {
    clarityScore += 3;
    clarityNotes.push(`Effective use of standard engineering terminology (${detectedTechTerms.slice(0, 4).join(", ")}).`);
  } else if (detectedTechTerms.length >= 2) {
    clarityScore += 1;
    clarityNotes.push("Used basic technical terms. Connect concepts more deeply to industry-standard patterns.");
  }

  clarityScore = Math.min(20, Math.max(0, clarityScore));

  // Grammar & Coherence Analysis
  const sentences = transcript.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  let grammarScore = 14;
  const grammarNotes: string[] = [];

  const avgSentenceLength = totalWords / Math.max(1, sentences.length);
  if (avgSentenceLength >= 10 && avgSentenceLength <= 28) {
    grammarScore += 4;
    grammarNotes.push("Balanced sentence length and professional conversational cadence.");
  } else if (avgSentenceLength > 35) {
    grammarScore -= 2;
    grammarNotes.push("Some overly long, run-on sentences. Break complex technical explanations into distinct points.");
  } else {
    grammarScore += 2;
    grammarNotes.push("Concise sentences. Add transitional phrases (e.g. 'Furthermore', 'Consequently') to improve flow.");
  }

  // Check for professional transition markers
  const transitions = ["furthermore", "however", "consequently", "for instance", "in contrast", "specifically", "as a result", "therefore"];
  const usedTransitions = transitions.filter((t) => transcript.toLowerCase().includes(t));
  if (usedTransitions.length >= 2) {
    grammarScore += 2;
    grammarNotes.push(`Well-structured transitions connecting ideas (${usedTransitions.slice(0, 2).join(", ")}).`);
  }

  grammarScore = Math.min(20, Math.max(0, grammarScore));

  return {
    clarityScore,
    clarityNotes,
    grammarScore,
    grammarNotes,
  };
}

/**
 * Evaluates content structure and talking point coverage.
 */
export function analyzeContentStructure(
  transcript: string,
  keyTalkingPoints: string[]
): {
  contentScore: number;
  contentNotes: string[];
  strengths: string[];
  improvements: string[];
} {
  const lower = transcript.toLowerCase();
  const contentNotes: string[] = [];
  const strengths: string[] = [];
  const improvements: string[] = [];

  let contentScore = 10;

  // Introduction Check
  const introMarkers = ["today", "welcome", "discuss", "present", "overview", "agenda", "problem", "first", "we will explore"];
  const hasIntro = introMarkers.some((m) => lower.includes(m));
  if (hasIntro) {
    contentScore += 3;
    strengths.push("Clear opening that frames the problem statement and sets audience expectations.");
    contentNotes.push("Structured introduction orienting the listener.");
  } else {
    improvements.push("Begin with a concise 30-second agenda preview outlining your key thesis before diving into details.");
    contentNotes.push("Introductory framing could be stronger; jumped quickly into technical details.");
  }

  // Talking points semantic coverage
  let pointsCovered = 0;
  for (const point of keyTalkingPoints) {
    const pointKeywords = point
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const matchCount = pointKeywords.filter((k) => lower.includes(k)).length;
    if (matchCount >= 2) {
      pointsCovered++;
    }
  }

  const coverageRatio = pointsCovered / Math.max(1, keyTalkingPoints.length);
  if (coverageRatio >= 0.7) {
    contentScore += 5;
    strengths.push(`Thorough coverage of key technical requirements (${pointsCovered}/${keyTalkingPoints.length} core themes addressed).`);
    contentNotes.push("Comprehensive topic coverage addressing major architectural dimensions.");
  } else if (coverageRatio >= 0.4) {
    contentScore += 3;
    contentNotes.push(`Moderate coverage (${pointsCovered}/${keyTalkingPoints.length} core themes addressed).`);
    improvements.push("Make sure to explicitly address all architectural trade-offs mentioned in the briefing.");
  } else {
    contentScore += 1;
    contentNotes.push("Limited coverage of the expected technical talking points.");
    improvements.push("Follow the provided talking points checklist more closely to ensure complete coverage.");
  }

  // Conclusion Check
  const conclusionMarkers = ["in conclusion", "to summarize", "in summary", "overall", "recommendation", "therefore", "to wrap up", "in short"];
  const hasConclusion = conclusionMarkers.some((m) => lower.includes(m));
  if (hasConclusion) {
    contentScore += 2;
    strengths.push("Strong concluding summary that reinforces the primary architectural recommendation.");
    contentNotes.push("Clean technical summary and conclusion.");
  } else {
    improvements.push("Conclude with an explicit summary summarizing the 2-3 key takeaways for decision makers.");
    contentNotes.push("Presentation ended somewhat abruptly without a structured summary.");
  }

  contentScore = Math.min(20, Math.max(0, contentScore));

  return {
    contentScore,
    contentNotes,
    strengths,
    improvements,
  };
}
