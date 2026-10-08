import { describe, it, expect } from "vitest";
import {
  calculateSpeakingMetrics,
  scorePaceAndFillers,
} from "../src/lib/communication/speech-analyzer";

describe("Speech Metrics, Pacing & Filler Word Detection", () => {
  it("should calculate Words Per Minute accurately and evaluate optimal cadence", () => {
    // 270 words spoken over 120 seconds (2.0 minutes) => 135 WPM
    const sampleWords = new Array(270).fill("word").join(" ");
    const metrics = calculateSpeakingMetrics(sampleWords, 120);

    expect(metrics.wordCount).toBe(270);
    expect(metrics.wordsPerMinute).toBe(135);
    expect(metrics.wpmAssessment).toBe("OPTIMAL");
  });

  it("should detect too slow and too fast speaking paces", () => {
    // 80 words in 60s => 80 WPM (TOO_SLOW)
    const slowText = new Array(80).fill("slow").join(" ");
    const slowMetrics = calculateSpeakingMetrics(slowText, 60);
    expect(slowMetrics.wordsPerMinute).toBe(80);
    expect(slowMetrics.wpmAssessment).toBe("TOO_SLOW");

    // 210 words in 60s => 210 WPM (TOO_FAST)
    const fastText = new Array(210).fill("rapid").join(" ");
    const fastMetrics = calculateSpeakingMetrics(fastText, 60);
    expect(fastMetrics.wordsPerMinute).toBe(210);
    expect(fastMetrics.wpmAssessment).toBe("TOO_FAST");
  });

  it("should detect all standard verbal filler words and patterns", () => {
    const transcript =
      "Um, today I will, uh, basically explain how REST works, and you know, like, it literally provides endpoints sort of like a resource, i mean, actually.";

    const metrics = calculateSpeakingMetrics(transcript, 60);
    expect(metrics.totalFillerWords).toBeGreaterThanOrEqual(8);
    expect(metrics.fillerWordsDetected["um"]).toBe(1);
    expect(metrics.fillerWordsDetected["uh"]).toBe(1);
    expect(metrics.fillerWordsDetected["basically"]).toBe(1);
    expect(metrics.fillerWordsDetected["you know"]).toBe(1);
    expect(metrics.fillerWordsDetected["like"]).toBe(2);
    expect(metrics.fillerWordsDetected["literally"]).toBe(1);
    expect(metrics.fillerWordsDetected["sort of"]).toBe(1);
    expect(metrics.fillerWordsDetected["actually"]).toBe(1);
  });

  it("should award higher scores for minimal filler word density", () => {
    // Clean speech (200 words, 0 fillers)
    const cleanSpeech = new Array(200).fill("engineering").join(" ");
    const cleanMetrics = calculateSpeakingMetrics(cleanSpeech, 90);
    const cleanScore = scorePaceAndFillers(cleanMetrics);

    expect(cleanMetrics.fillerWordDensityPercent).toBe(0);
    expect(cleanScore.score).toBeGreaterThanOrEqual(18); // 10 filler + 8-10 pace

    // Speech overloaded with fillers
    const fillerHeavy = "Um uh basically like you know actually literally sort of kind of i mean " + new Array(20).fill("word").join(" ");
    const heavyMetrics = calculateSpeakingMetrics(fillerHeavy, 60);
    const heavyScore = scorePaceAndFillers(heavyMetrics);

    expect(heavyMetrics.fillerWordDensityPercent).toBeGreaterThan(15);
    expect(heavyScore.score).toBeLessThanOrEqual(10);
  });
});
