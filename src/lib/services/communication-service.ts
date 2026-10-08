import { prisma } from "../db";
import { getTopicById, getRandomTopic, CommunicationTopic, COMMUNICATION_TOPICS } from "../communication/topics";
import { evaluatePresentation } from "../communication/evaluator";
import {
  generateEphemeralStorageKey,
  saveEphemeralRecording,
  deleteEphemeralRecording,
} from "../communication/privacy-storage";
import { CommunicationEvaluationRubric } from "../communication/rubric";

export interface StartSubmissionResult {
  submissionId: string;
  topic: CommunicationTopic;
  prepDurationSeconds: number;
  maxPresentationDurationSeconds: number;
  minPresentationDurationSeconds: number;
  storageKey: string;
}

/**
 * Initializes a new communication presentation session for a student.
 */
export async function startCommunicationSubmission(
  userId: string,
  topicId?: string
): Promise<StartSubmissionResult> {
  const topic = (topicId ? getTopicById(topicId) : undefined) || getRandomTopic();
  const storageKey = generateEphemeralStorageKey();

  const submission = await prisma.communicationSubmission.create({
    data: {
      userId,
      topicTitle: topic.title,
      durationSeconds: 0,
      storageKey,
      status: "PENDING_EVALUATION",
      feedbackJson: {
        topicId: topic.id,
        domain: topic.domain,
        targetAudience: topic.targetAudience,
        prepStartedAt: new Date().toISOString(),
      },
    },
  });

  return {
    submissionId: submission.id,
    topic,
    prepDurationSeconds: topic.prepDurationSeconds,
    maxPresentationDurationSeconds: topic.maxPresentationDurationSeconds,
    minPresentationDurationSeconds: topic.minPresentationDurationSeconds,
    storageKey,
  };
}

export interface ProcessSubmissionParams {
  userId: string;
  submissionId: string;
  durationSeconds: number;
  transcript: string;
  hasVideoFeed: boolean;
  videoBuffer?: Buffer;
  mimeType?: string;
}

/**
 * Processes the uploaded presentation, runs evaluation, securely purges
 * the temporary video file, and updates the database record with verifiable deletion.
 */
export async function processAndEvaluateSubmission(
  params: ProcessSubmissionParams
): Promise<{
  submissionId: string;
  rubric: CommunicationEvaluationRubric;
  videoDeletedAt: Date;
  passed: boolean;
  overallScore: number;
}> {
  const { userId, submissionId, durationSeconds, transcript, hasVideoFeed, videoBuffer, mimeType } = params;

  // 1. Fetch submission and verify authorization
  const submission = await prisma.communicationSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new Error("Communication submission not found.");
  }

  if (submission.userId !== userId) {
    throw new Error("Unauthorized access to communication submission.");
  }

  // 2. Resolve topic metadata
  const meta = submission.feedbackJson as Record<string, any> | null;
  const topicId = meta?.topicId;
  const topic = (topicId ? getTopicById(topicId) : undefined) ||
    COMMUNICATION_TOPICS.find((t) => t.title === submission.topicTitle) ||
    getRandomTopic();

  // 3. Save ephemeral recording if buffer provided
  let tempFilePath: string | undefined;
  if (videoBuffer && videoBuffer.length > 0) {
    const saved = await saveEphemeralRecording(
      submission.storageKey,
      videoBuffer,
      mimeType || "video/webm"
    );
    tempFilePath = saved.filePath;
  }

  // 4. Run AI / Heuristic evaluation pipeline
  let evaluationResult: CommunicationEvaluationRubric;
  try {
    evaluationResult = await evaluatePresentation({
      topic,
      durationSeconds,
      transcript,
      hasVideoFeed,
      videoFilePath: tempFilePath,
      videoMimeType: mimeType,
    });
  } catch (err) {
    // Ensure temporary video is purged even if evaluation throws an unexpected error
    await deleteEphemeralRecording(submission.storageKey);
    throw err;
  }

  // 5. Ephemeral lifecycle guarantee: Delete temporary video immediately
  const { videoDeletedAt } = await deleteEphemeralRecording(submission.storageKey);

  // 6. Persist scores and structured feedback in database
  const feedbackData = {
    ...evaluationResult,
    topicId: topic.id,
    topicTitle: topic.title,
    targetAudience: topic.targetAudience,
    scenario: topic.scenario,
    videoDeletedAt: videoDeletedAt.toISOString(),
  };

  await prisma.communicationSubmission.update({
    where: { id: submissionId },
    data: {
      durationSeconds,
      contentScore: evaluationResult.content.rawScore,
      clarityScore: evaluationResult.clarity.rawScore,
      grammarScore: evaluationResult.grammar.rawScore,
      paceScore: evaluationResult.pace.rawScore,
      visualDeliveryScore: evaluationResult.visualDelivery.rawScore,
      overallScore: evaluationResult.overallScore,
      passed: evaluationResult.passed,
      feedbackJson: feedbackData as any,
      status: "COMPLETED",
      videoDeletedAt,
    },
  });

  return {
    submissionId,
    rubric: evaluationResult,
    videoDeletedAt,
    passed: evaluationResult.passed,
    overallScore: evaluationResult.overallScore,
  };
}

/**
 * Retrieves the scorecard and detailed rubric for a completed presentation.
 */
export async function getSubmissionResult(userId: string, submissionId: string) {
  const submission = await prisma.communicationSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    return null;
  }

  if (submission.userId !== userId) {
    throw new Error("Unauthorized to access this submission result.");
  }

  return submission;
}

/**
 * Retrieves past communication presentation history for the user.
 */
export async function getUserCommunicationHistory(userId: string) {
  const submissions = await prisma.communicationSubmission.findMany({
    where: { userId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
  });

  const total = submissions.length;
  const passed = submissions.filter((s) => s.passed).length;
  const averageScore =
    total > 0
      ? Math.round(submissions.reduce((acc, s) => acc + s.overallScore, 0) / total)
      : 0;

  return {
    submissions,
    stats: {
      totalAttempts: total,
      passedCount: passed,
      passRatePercent: total > 0 ? Math.round((passed / total) * 100) : 0,
      averageScore,
    },
  };
}
