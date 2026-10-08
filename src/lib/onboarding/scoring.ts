import {
  CAREER_QUESTIONNAIRE,
  CAREER_TRACKS,
  SUPPORTED_SKILLS,
  CareerTrackInfo,
} from "./tracks";

export type CareerTrackType = CareerTrackInfo["id"];

export interface QuestionnaireAnswerSubmission {
  questionId: string;
  optionId: string;
}

export type SkillRatings = Record<string, number>; // e.g. { java: 3, python: 4, ... }

export interface TrackScoreBreakdown {
  trackId: CareerTrackType;
  trackTitle: string;
  score: number; // 0 to 100
  questionnairePoints: number; // 0 to 60
  skillPoints: number; // 0 to 40
  contributingFactors: string[];
  skillSummary: string;
  recommendationLevel: "STRONG_MATCH" | "GOOD_FIT" | "EXPLORING";
}

export interface CompatibilityResult {
  scores: Record<CareerTrackType, number>;
  recommendedTrack: CareerTrackType;
  breakdowns: Record<CareerTrackType, TrackScoreBreakdown>;
  guidanceDisclaimer: string;
}

export function calculateCareerCompatibility(
  answers: QuestionnaireAnswerSubmission[],
  skillRatings: SkillRatings
): CompatibilityResult {
  const rawQPoints: Record<CareerTrackType, number> = {
    SOFTWARE_ENGINEER: 0,
    WEB_DEVELOPER: 0,
    DATA_ANALYST: 0,
  };

  const factorsMap: Record<CareerTrackType, string[]> = {
    SOFTWARE_ENGINEER: [],
    WEB_DEVELOPER: [],
    DATA_ANALYST: [],
  };

  // 1. Process Questionnaire (up to 60 points)
  for (const answer of answers) {
    const question = CAREER_QUESTIONNAIRE.find((q) => q.id === answer.questionId);
    if (!question) continue;

    const selectedOption = question.options.find((opt) => opt.id === answer.optionId);
    if (!selectedOption) continue;

    (["SOFTWARE_ENGINEER", "WEB_DEVELOPER", "DATA_ANALYST"] as CareerTrackType[]).forEach(
      (track) => {
        const weight = selectedOption.weights[track];
        rawQPoints[track] += weight;

        // If strong affinity (>= 8 points), record as contributing factor
        if (weight >= 8) {
          factorsMap[track].push(
            `In "${question.category}": Selected "${selectedOption.text.slice(0, 45)}..." (+${weight} pts)`
          );
        }
      }
    );
  }

  // Normalize Questionnaire: 6 questions * 10 max weight = 60 max points
  const qScores: Record<CareerTrackType, number> = {
    SOFTWARE_ENGINEER: Math.min(60, Math.round(rawQPoints.SOFTWARE_ENGINEER)),
    WEB_DEVELOPER: Math.min(60, Math.round(rawQPoints.WEB_DEVELOPER)),
    DATA_ANALYST: Math.min(60, Math.round(rawQPoints.DATA_ANALYST)),
  };

  // 2. Process Skill Self-Assessments (up to 40 points)
  // Each rating is 1 to 5.
  const getRating = (key: string) => Math.max(1, Math.min(5, skillRatings[key] || 1));

  // Software Engineer: Java, Python, C++, SQL (max total 20 rating points -> scaled to 40)
  const seSkillSum =
    getRating("java") + getRating("python") + getRating("cpp") + getRating("sql");
  const seSkillPoints = Math.min(40, Math.round((seSkillSum / 20) * 40));

  // Web Developer: JavaScript (x2 weight), HTML/CSS (x2 weight) (max 20 weighted -> scaled to 40)
  const webSkillSum = getRating("javascript") * 2 + getRating("html_css") * 2;
  const webSkillPoints = Math.min(40, Math.round((webSkillSum / 20) * 40));

  // Data Analyst: SQL (x2.5 weight), Python (x1.5 weight) (max 20 weighted -> scaled to 40)
  const dataSkillSum = getRating("sql") * 2.5 + getRating("python") * 1.5;
  const dataSkillPoints = Math.min(40, Math.round((dataSkillSum / 20) * 40));

  const skillPointsMap: Record<CareerTrackType, number> = {
    SOFTWARE_ENGINEER: seSkillPoints,
    WEB_DEVELOPER: webSkillPoints,
    DATA_ANALYST: dataSkillPoints,
  };

  // 3. Assemble Track Breakdowns
  const breakdowns: Record<CareerTrackType, TrackScoreBreakdown> = {} as any;
  const finalScores: Record<CareerTrackType, number> = {
    SOFTWARE_ENGINEER: 0,
    WEB_DEVELOPER: 0,
    DATA_ANALYST: 0,
  };

  (["SOFTWARE_ENGINEER", "WEB_DEVELOPER", "DATA_ANALYST"] as CareerTrackType[]).forEach(
    (track) => {
      const qPts = qScores[track];
      const sPts = skillPointsMap[track];
      const total = Math.min(100, Math.max(0, qPts + sPts));
      finalScores[track] = total;

      let recommendationLevel: TrackScoreBreakdown["recommendationLevel"] = "EXPLORING";
      if (total >= 75) recommendationLevel = "STRONG_MATCH";
      else if (total >= 50) recommendationLevel = "GOOD_FIT";

      let skillSummary = "";
      if (track === "SOFTWARE_ENGINEER") {
        skillSummary = `Core skills (Java: ${getRating("java")}/5, C++: ${getRating("cpp")}/5, Python: ${getRating("python")}/5).`;
      } else if (track === "WEB_DEVELOPER") {
        skillSummary = `Core skills (HTML/CSS: ${getRating("html_css")}/5, JS: ${getRating("javascript")}/5).`;
      } else {
        skillSummary = `Core skills (SQL: ${getRating("sql")}/5, Python: ${getRating("python")}/5).`;
      }

      breakdowns[track] = {
        trackId: track,
        trackTitle: CAREER_TRACKS[track].title,
        score: total,
        questionnairePoints: qPts,
        skillPoints: sPts,
        contributingFactors:
          factorsMap[track].length > 0
            ? factorsMap[track]
            : ["General problem-solving and foundational interest."],
        skillSummary,
        recommendationLevel,
      };
    }
  );

  // Determine highest recommended track
  let recommendedTrack: CareerTrackType = "SOFTWARE_ENGINEER";
  let maxScore = -1;
  for (const track of ["SOFTWARE_ENGINEER", "WEB_DEVELOPER", "DATA_ANALYST"] as CareerTrackType[]) {
    if (finalScores[track] > maxScore) {
      maxScore = finalScores[track];
      recommendedTrack = track;
    }
  }

  return {
    scores: finalScores,
    recommendedTrack,
    breakdowns,
    guidanceDisclaimer:
      "Career compatibility scores are transparent educational guidance, not a barrier. Low initial skill levels never prevent you from choosing any career track. You may select whichever path aligns with your aspirations.",
  };
}
