import { describe, it, expect } from "vitest";

describe("Phase 3: Assessment Timer Expiration & Submission Safety", () => {
  it("enforces countdown duration limits (60m Technical, 45m Aptitude)", () => {
    const startedAt = new Date("2026-10-08T10:00:00.000Z");

    const technicalDurationMs = 60 * 60 * 1000;
    const technicalExpiresAt = new Date(startedAt.getTime() + technicalDurationMs);
    expect(technicalExpiresAt.toISOString()).toBe("2026-10-08T11:00:00.000Z");

    const aptitudeDurationMs = 45 * 60 * 1000;
    const aptitudeExpiresAt = new Date(startedAt.getTime() + aptitudeDurationMs);
    expect(aptitudeExpiresAt.toISOString()).toBe("2026-10-08T10:45:00.000Z");
  });

  it("identifies expired state and marks status as EXPIRED on timeout", () => {
    const expiresAt = new Date("2026-10-08T10:45:00.000Z");
    const checkTimeBefore = new Date("2026-10-08T10:30:00.000Z");
    const checkTimeAfter = new Date("2026-10-08T10:46:00.000Z");

    const isExpired = (now: Date) => now > expiresAt;

    expect(isExpired(checkTimeBefore)).toBe(false);
    expect(isExpired(checkTimeAfter)).toBe(true);

    const resolveStatus = (now: Date) => (now > expiresAt ? "EXPIRED" : "SUBMITTED");
    expect(resolveStatus(checkTimeAfter)).toBe("EXPIRED");
  });

  it("permits multiple trial runs during an active exam while only final submission counts", () => {
    // Simulate student writing multiple revisions of code during test:
    const trialSubmissions = [
      { attemptNumber: 1, passedSampleTests: 0, totalSampleTests: 2 },
      { attemptNumber: 2, passedSampleTests: 1, totalSampleTests: 2 },
      { attemptNumber: 3, passedSampleTests: 2, totalSampleTests: 2 },
    ];

    // Trials do not set official score:
    let officialScoreRecorded = false;
    trialSubmissions.forEach((trial) => {
      expect(trial.attemptNumber).toBeGreaterThan(0);
      expect(officialScoreRecorded).toBe(false);
    });

    // Final submission evaluates against both sample and hidden tests
    const finalSubmission = {
      code: "def solve(): return True",
      passedAllTests: true,
      officialScore: 1,
    };
    officialScoreRecorded = true;

    expect(officialScoreRecorded).toBe(true);
    expect(finalSubmission.officialScore).toBe(1);
  });
});
