# CAREERORBIT — DATABASE SPECIFICATION

## 1. Database Overview
* **RDBMS:** PostgreSQL (compatible with Neon, Supabase, AWS RDS, local PostgreSQL).
* **ORM:** Prisma 7.10.0 (`@prisma/client` with `@prisma/adapter-pg`).
* **Connection Pooling:** Managed via standard connection string pooling parameters.

## 2. Models & Schema Architecture

### User
Primary account record representing students and administrators.
* `id` (UUID, Primary Key)
* `email` (String, Unique Index)
* `userId` (String, Unique Index)
* `passwordHash` (String, Argon2id)
* `fullName` (String)
* `course` (String)
* `branch` (String)
* `semester` (Integer)
* `role` (Enum: `STUDENT`, `ADMIN`)
* `avatarUrl` (String, Optional)
* `userIdChangedAt` (DateTime, Optional) — Enforces 90-day cooldown.
* `deletionRequestedAt` (DateTime, Optional) — Tracks 14-day deletion grace period.
* `accountStatus` (Enum: `ACTIVE`, `PENDING_DELETION`)
* `createdAt`, `updatedAt` (DateTime)

### EmailVerification
Cryptographic verification tokens for registration, password resets, and email updates.
* `id` (UUID, Primary Key)
* `email` (String)
* `otpHash` (String) — Salted SHA-256 hash.
* `type` (Enum: `REGISTRATION`, `PASSWORD_RESET`, `EMAIL_CHANGE`)
* `attempts` (Integer, default 0) — Enforces max 5 attempts.
* `expiresAt` (DateTime) — 10-minute expiry.
* `verifiedAt` (DateTime, Optional)

### CareerProfile
Student track selection, diagnostic scores, and timeline parameters.
* `id` (UUID, Primary Key)
* `userId` (UUID, Unique Foreign Key -> User, Cascade Delete)
* `selectedTrack` (Enum: `SOFTWARE_ENGINEER`, `WEB_DEVELOPER`, `DATA_ANALYST`)
* `targetWeeks` (Integer, default 12)
* `targetDate` (DateTime, Optional)
* `dailyMinutesTarget` (Integer, default 90)
* `diagnosticScores` (JSON)
* `compatibilityBreakdown` (JSON)

### Roadmap & RoadmapTask
Hierarchical curriculum structure with strict prerequisite locking.
* `Roadmap`: `id`, `userId` (FK -> User), `trackId`, `title`, `currentWeek`, `currentDay`, `isCompleted`.
* `RoadmapTask`: `id`, `roadmapId` (FK -> Roadmap), `weekNumber`, `dayNumber`, `title`, `description`, `taskType` (`LEARNING`, `PRACTICE`, `ASSESSMENT`), `durationMinutes`, `prerequisites` (JSON array of task IDs), `status` (`LOCKED`, `AVAILABLE`, `COMPLETED`), `completedAt`.

### Question & CuratedResource
Question bank supporting MCQs and coding challenges with hidden test case protection.
* `Question`: `id`, `track`, `topic`, `questionType` (`CONCEPTUAL`, `CODE_OUTPUT`, `DEBUGGING`, `CODING_PROBLEM`), `difficulty` (`EASY`, `MEDIUM`, `HARD`), `prompt`, `options` (JSON), `correctOption`, `sampleTestCases` (JSON), `hiddenTestCases` (JSON - secret), `starterCode` (JSON), `solutionExplanation`, `verificationStatus` (`PENDING`, `APPROVED`, `REJECTED`), `createdBy`.
* `CuratedResource`: `id`, `taskId` (FK -> RoadmapTask), `title`, `url`, `resourceType`, `isVerified`, `lastCheckedAt`.

### AssessmentAttempt & SubmissionAnswer
Records assessment sessions, countdown timers, and answer grading.
* `AssessmentAttempt`: `id`, `userId` (FK -> User), `assessmentType`, `level`, `score`, `totalQuestions` (25), `passed`, `startedAt`, `submittedAt`, `expiresAt`, `status` (`IN_PROGRESS`, `SUBMITTED`, `EXPIRED`).
* `SubmissionAnswer`: `id`, `attemptId` (FK -> AssessmentAttempt), `questionId` (FK -> Question), `selectedOption`, `submittedCode`, `language`, `passedTests`, `totalTests`, `executionStatus`, `scoreAwarded`.

### CommunicationSubmission
Speech presentation assessment scores and privacy cleanup audit.
* `id` (UUID, Primary Key)
* `userId` (UUID, FK -> User, Cascade Delete)
* `topicTitle` (String)
* `durationSeconds` (Integer)
* `storageKey` (String)
* `contentScore`, `clarityScore`, `grammarScore`, `paceScore`, `visualDeliveryScore`, `overallScore` (Integer)
* `passed` (Boolean)
* `feedbackJson` (JSON)
* `status` (Enum: `PENDING_EVALUATION`, `COMPLETED`, `FAILED`)
* `videoDeletedAt` (DateTime, Optional) — Proof of confirmed video deletion.

### GamificationState & AuditLog
Tracks student milestones, badges, and streaks.
* `GamificationState`: `id`, `userId` (FK -> User), `currentStreak`, `longestStreak`, `lastActiveDate`, `streakFreezeCount`, `earnedBadges` (JSON), `totalPoints`.
* `AuditLog`: `id`, `userId` (Optional FK), `eventType`, `metadata` (JSON), `ipAddress`, `createdAt`.

## 3. Database Indexes & Query Optimization
* Indexes on `User.email` and `User.userId` for $O(1)$ lookups during login.
* Compound index on `[accountStatus, deletionRequestedAt]` for efficient purge queries.
* Compound index on `[email, type]` on `EmailVerification`.
* Compound index on `[roadmapId, weekNumber, dayNumber]` for roadmap rendering.
