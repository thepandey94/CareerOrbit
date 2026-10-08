import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTechnicalAttemptResult } from "../src/lib/services/technical-service";
import { getAptitudeAttemptResult } from "../src/lib/services/aptitude-service";
import {
  getSubmissionResult,
  processAndEvaluateSubmission,
} from "../src/lib/services/communication-service";
import prisma from "../src/lib/db";

const { mockDb } = vi.hoisted(() => {
  const db = {
    assessmentAttempt: {
      findUnique: vi.fn(),
    },
    communicationSubmission: {
      findUnique: vi.fn(),
    },
  };
  return { mockDb: db };
});

// Mock prisma client
vi.mock("../src/lib/db", () => {
  return {
    default: mockDb,
    prisma: mockDb,
  };
});

describe("Security Hardening: Strict Cross-User Data Isolation", () => {
  const userA = "student-alice-123";
  const userB = "student-attacker-bob-999";
  const attemptId = "attempt-uuid-001";
  const submissionId = "submission-uuid-002";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should prevent User B from reading User A's technical round results", async () => {
    const aliceAttempt = {
      id: attemptId,
      userId: userA,
      assessmentType: "TECHNICAL",
      level: 1,
      score: 22,
      totalQuestions: 25,
      passed: true,
      answers: [],
    };

    (prisma.assessmentAttempt.findUnique as any).mockResolvedValue(aliceAttempt);

    // Bob tries to access Alice's attempt
    await expect(
      getTechnicalAttemptResult(userB, attemptId)
    ).rejects.toThrowError(/Attempt not found or unauthorized/);
  });

  it("should prevent User B from reading User A's aptitude assessment results", async () => {
    const aliceAttempt = {
      id: attemptId,
      userId: userA,
      assessmentType: "APTITUDE",
      level: 1,
      score: 18,
      totalQuestions: 25,
      passed: true,
      answers: [],
    };

    (prisma.assessmentAttempt.findUnique as any).mockResolvedValue(aliceAttempt);

    // Bob tries to access Alice's attempt
    await expect(
      getAptitudeAttemptResult(userB, attemptId)
    ).rejects.toThrowError(/Attempt not found or unauthorized/);
  });

  it("should prevent User B from viewing User A's communication scorecard", async () => {
    const aliceSubmission = {
      id: submissionId,
      userId: userA,
      topicTitle: "System Architecture",
      overallScore: 82,
      passed: true,
    };

    (prisma.communicationSubmission.findUnique as any).mockResolvedValue(aliceSubmission);

    // Bob attempts to fetch Alice's submission result
    await expect(
      getSubmissionResult(userB, submissionId)
    ).rejects.toThrowError(/Unauthorized to access this submission result/);
  });

  it("should prevent User B from submitting or evaluating User A's communication recording", async () => {
    const aliceSubmission = {
      id: submissionId,
      userId: userA,
      topicTitle: "Database Indexing",
      status: "IN_PROGRESS",
    };

    (prisma.communicationSubmission.findUnique as any).mockResolvedValue(aliceSubmission);

    // Bob tries to upload/process on Alice's submission
    await expect(
      processAndEvaluateSubmission({
        userId: userB,
        submissionId,
        durationSeconds: 120,
        transcript: "Testing tampering...",
        hasVideoFeed: true,
      })
    ).rejects.toThrowError(/Unauthorized access to communication submission/);
  });
});
