import { describe, it, expect } from "vitest";
import { COMMUNICATION_TOPICS, getTopicById } from "../src/lib/communication/topics";
import { evaluatePresentation } from "../src/lib/communication/evaluator";

describe("Communication Duration Limits & Evaluation Pipeline", () => {
  it("should enforce 5-minute prep (300s) and 7-minute presentation max (420s) across all topics", () => {
    expect(COMMUNICATION_TOPICS.length).toBeGreaterThanOrEqual(8);

    for (const topic of COMMUNICATION_TOPICS) {
      expect(topic.prepDurationSeconds).toBe(300); // 5 minutes
      expect(topic.maxPresentationDurationSeconds).toBe(420); // 7 minutes
      expect(topic.minPresentationDurationSeconds).toBe(60); // 1 minute
      expect(topic.keyTalkingPoints.length).toBeGreaterThanOrEqual(3);
      expect(topic.evaluationCriteria.length).toBeGreaterThanOrEqual(2);
      expect(topic.scenario.length).toBeGreaterThan(50);
    }
  });

  it("should evaluate a realistic speech delivery using the evaluation pipeline", async () => {
    const topic = getTopicById("se-rest-vs-graphql")!;
    expect(topic).toBeDefined();

    const transcript = `
      Today I am presenting a comparison between REST and GraphQL for our engineering team.
      In our current architecture, mobile clients suffer from over-fetching and under-fetching when querying REST endpoints.
      GraphQL allows declarative client querying, which significantly reduces network payload latency on mobile networks.
      However, GraphQL complicates caching because queries are POST requests, preventing standard HTTP and CDN caching.
      Furthermore, we must be careful with the N+1 problem on the database, which we can solve using DataLoader batching.
      In conclusion, I recommend keeping REST for our public caching tier and adopting GraphQL for client-facing aggregations.
    `;

    const rubric = await evaluatePresentation({
      topic,
      durationSeconds: 150, // 2.5 minutes
      transcript,
      hasVideoFeed: true,
    });

    expect(rubric.content.rawScore).toBeGreaterThanOrEqual(10);
    expect(rubric.clarity.rawScore).toBeGreaterThanOrEqual(10);
    expect(rubric.grammar.rawScore).toBeGreaterThanOrEqual(10);
    expect(rubric.pace.rawScore).toBeGreaterThanOrEqual(10);
    expect(rubric.overallScore).toBeGreaterThanOrEqual(50);
    expect(rubric.speakingMetrics.wordsPerMinute).toBeGreaterThan(0);
    expect(rubric.ethicalSafeguardsApplied.accentNeutralityEnforced).toBe(true);
    expect(rubric.ethicalSafeguardsApplied.pseudoscienceExcluded).toBe(true);
    expect(["gemini-2.5-flash", "heuristic-speech-analyzer"]).toContain(rubric.evaluatedBy);
  });

  it("should exclude visual delivery and normalize when audio-only", async () => {
    const topic = getTopicById("se-database-indexing")!;
    const transcript = "Today we discuss database indexing and B-Trees to solve table scans and improve query latency. In conclusion indexing speeds up reads but adds write overhead.";

    const rubric = await evaluatePresentation({
      topic,
      durationSeconds: 90,
      transcript,
      hasVideoFeed: false, // audio only
    });

    expect(rubric.visualDeliveryExcluded).toBe(true);
    expect(rubric.visualDelivery.reliable).toBe(false);
    expect(rubric.overallScore).toBeGreaterThanOrEqual(0);
    expect(rubric.overallScore).toBeLessThanOrEqual(100);
  });
});
