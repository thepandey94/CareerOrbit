# CAREERORBIT — ARCHITECTURE SPECIFICATION

## 1. System Overview

CareerOrbit uses a unified full-stack architecture built on **Next.js 16.4.0 (App Router)**, **React 19.3.0**, **TypeScript**, and **Prisma 7.10.0** connected to PostgreSQL.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CAREERORBIT SYSTEM ARCHITECTURE                 │
├────────────────────────────────────────────────────────────────────────┤
│ Client Layer:                                                          │
│   • Next.js App Router (React 19 Server & Client Components)           │
│   • Accessible Light/Dark Theme Provider (persistent in localStorage) │
│   • Semantic HTML & Tailwind CSS v4 design tokens                      │
├────────────────────────────────────────────────────────────────────────┤
│ Server Security Boundary:                                              │
│   • iron-session encrypted HTTP-only cookie management (AES-256-GCM)   │
│   • Zod payload validation on every API endpoint                       │
│   • Role-based Access Control (RBAC) enforced on server                │
│   • Business Service Layer (AuthService, UserService, AdminService)    │
├────────────────────────────────────────────────────────────────────────┤
│ Data & Persistence Layer:                                              │
│   • Prisma 7 ORM with @prisma/adapter-pg driver adapter                │
│   • Cloud PostgreSQL (Neon / Supabase) with prepared SQL statements    │
│   • Soft-deletion & 14-day grace period state machine                  │
└────────────────────────────────────────────────────────────────────────┘
```

## 2. Request & Data Flows

### 2.1 User Registration Flow
1. **Request Code:** Client submits email to `POST /api/auth/register/request-otp`.
2. **Rate Limit & Duplicate Check:** Server verifies email is not already taken and enforces a 60-second cooldown between OTP requests.
3. **Crypto Generation:** 6-digit random code generated via `crypto.randomInt()`. Salted SHA-256 hash stored in `EmailVerification` table with 10-minute expiry.
4. **Delivery:** Dispatched via Resend API (or logged to terminal in dev mode).
5. **Verification:** Client submits OTP to `POST /api/auth/register/verify-otp`. Server checks attempts ($\le 5$), verifies hash using timing-safe comparison, and stamps `verifiedAt = now()`.
6. **Completion:** Client submits profile details, desired User ID, and password ($\ge 12$ chars) to `POST /api/auth/register/complete`.
7. **Storage:** Password hashed using Argon2id. User record and initial gamification state created in a database transaction. Encrypted session cookie set.

### 2.2 Dual Login Flow
1. Client submits identifier (email OR User ID) and password to `POST /api/auth/login`.
2. Server queries user by email OR User ID.
3. If not found, returns generic `401 Unauthorized` (*"Invalid email/user ID or password"*).
4. Password verified against Argon2id hash.
5. If account is `PENDING_DELETION`, login intercepts normal session creation and returns redirection payload to `/account-pending-deletion`.
6. If active, encrypted session cookie is established.

### 2.3 14-Day Account Deletion Lifecycle
```
[User initiates deletion with password]
              │
              ▼
[Server sets accountStatus = PENDING_DELETION]
[Server sets deletionRequestedAt = NOW()]
[Active session cookies destroyed]
              │
      ┌───────┴────────────────────────┐
      │                                │
(Login during 14 days)         (14 days elapse)
      ▼                                ▼
[Redirect to recovery screen]   [Daily cron job finds accounts]
[User enters password to cancel] [Cascades hard deletion]
      ▼                         [Purges avatar files from storage]
[accountStatus = ACTIVE]
[deletionRequestedAt = null]
[Full access restored]
```

## 3. Layer Separation & Code Responsibilities

* `src/app/api/*`: HTTP transport layer. Parses JSON, executes Zod schema validation, calls service layer, and returns standardized JSON responses.
* `src/lib/services/*`: Pure business logic. Handles transactions, cooldown checks, and database mutations.
* `src/lib/onboarding/*`: Career track specifications, transparent compatibility scoring rubric, and diagnostic assessments.
* `src/lib/roadmap/*`: Curriculum definitions, verified resource metadata, timeline estimation, and prerequisite state machine.
* `src/lib/ai/*`: Google Gemini 2.5 Flash integration, academic integrity guardrails, and deterministic offline content fallback.
* `src/lib/auth/*`: Security primitives. Password hashing (Argon2id), OTP generation, and session serialization.
* `src/lib/db.ts`: Database connection singleton. Manages connection pooling via driver adapter.

---

## 4. Phase 2: Career Onboarding & Learning Architecture

### 4.1 Career Compatibility Scoring Engine
1. **Input Vectors:**
   - 6-dimension questionnaire answers (interests, problem-solving preferences, work output pride, curiosity triggers).
   - 6-item skill self-assessment matrix (Java, Python, JavaScript, SQL, C++, HTML/CSS rated 1–5).
2. **Transparent Formula:**
   $$\text{Total Score} = \min\left(100, \text{Questionnaire Points (max 60)} + \text{Skill Points (max 40)}\right)$$
3. **Guidance Guarantee:**
   - Evaluated purely as educational guidance.
   - Low initial scores never restrict students from choosing any career track.

### 4.2 Sequential Roadmap & Prerequisite State Machine
```
[Day 1 Learning Task] (status: AVAILABLE)
        │ (Completed by student)
        ▼
[Day 1 Practice Task] (status: AVAILABLE)
        │ (Completed by student)
        ▼
[Day 1 Daily Assessment] (status: AVAILABLE)
        │ (Scored on server >= 60%)
        ▼
[Day 2 Learning Task] (transition: LOCKED -> AVAILABLE)
```
- Each task explicitly evaluates its `prerequisites` array against the user's roadmap state.
- Locked tasks display explicit guidance indicating which specific module must be completed first.

### 4.3 AI Study Tutor & Academic Integrity Guardrail
```
[Student Question] ───> [Academic Integrity Guardrail]
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
       (Active Exam / Cheat Attempt)     (Conceptual Question)
                  │                               │
                  ▼                               ▼
      [Refuse Direct Solutions]          [Check GEMINI_API_KEY]
      [Offer Conceptual Mentor Advice]            │
                                       ┌──────────┴──────────┐
                                       ▼                     ▼
                                [Gemini 2.5 Flash]    [Verified Content]
                                (Live Multimodal)     (Offline Knowledge Base)
```
1. Active assessment mode and cheat query patterns are intercepted before reaching the LLM.
2. The tutor explains underlying concepts, provides real-world analogies, and debugs logic without solving exam questions.
3. If `GEMINI_API_KEY` is omitted or encounters network/rate limits, the application serves curated, verified knowledge base responses with truthful provider labeling.
