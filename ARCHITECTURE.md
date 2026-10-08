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

---

## 5. Phase 3: Technical Round, Aptitude & Sandboxed Code Execution

### 5.1 Sandboxed Code Execution Architecture (Java & Python)
```
[Student Browser]
       │
       │ (1) POST /api/technical/trial OR /api/playground/execute
       ▼
[Next.js Server API] ──(Validates Auth, Timer, Code Size <= 64KB)──┐
       │                                                            │
       │ (2) Prepares Sandbox Request                               │
       ▼                                                            ▼
[Isolated Execution Sandbox]                           [Secret Test Cases in DB]
(Piston / Judge0 cgroups container)                    (Sample vs. Hidden Test Cases)
  • Memory limit: 128MB                                             │
  • Execution timeout: 5.0s                                         │
  • No outbound network access                                      │
       │                                                            │
       │ (3) Returns stdout, stderr, exitCode, duration             │
       ▼                                                            │
[Next.js Grading Engine] <──────────────────────────────────────────┘
  • Evaluates sample test cases (reveals input & output for debugging)
  • Evaluates hidden test cases (STRICTLY OMITS inputs & outputs)
       │
       │ (4) Returns sanitized results to browser
       ▼
[Student Exam UI] (Passed count: 4/5; secret inputs NEVER leaked)
```

1. **Security Isolation:** Arbitrary student code is never executed on the host Next.js application server. It executes inside an isolated cgroup/container sandbox with a 5-second timeout and zero network egress.
2. **Language Restriction:** Strictly restricted to **Java (OpenJDK)** and **Python (3.10+)**. Unsupported languages are rejected immediately.
3. **Secret Test-Case Protection:** Inputs and expected outputs of hidden test cases are permanently protected on the server. The client browser only ever receives boolean pass/fail indicators and test counts.
4. **Independent Playground:** A standalone Java/Python sandbox (`/playground`) allows freeform experimentation and custom stdin execution without altering official assessment scores.

### 5.2 Technical Round Examination Specification
* **25 Questions per Level:**
  * 15 Conceptual knowledge questions
  * 5 Code-output / debugging questions
  * 5 Algorithmic coding problems with starter code, sample test cases, and hidden test cases
* **Scoring Rubric:** Equal marks (1 mark per question = 25 marks total), zero negative marking.
* **Timed Execution:** 60-minute countdown with automatic submission upon timeout.
* **Trial Submissions:** Unlimited trial runs on sample test cases while the timer runs; only the final submission is officially graded against hidden test cases.
* **Passing Threshold:** 60% (15/25 required to pass).
* **Topic-Level Performance Review:** Topic competency breakdown highlighting weak areas (<60%) for focused revision. Unlimited retakes allow taking a fresh assessment of equivalent difficulty.

### 5.3 Aptitude Module Specification
* **25 Timed Questions:**
  * 10 Quantitative Aptitude questions
  * 8 Logical Reasoning questions
  * 7 Verbal Ability questions
* **Scoring Rubric:** Equal marks (1 mark each), no negative marking, 45-minute countdown with auto-submit on timeout.
* **Passing Threshold:** 60% (15/25 required).
* **Review & Diagnostics:** Category-level breakdown (Quantitative %, Logical %, Verbal %), weak-topic diagnosis, and comprehensive step-by-step solution explanations for every question.

---

## 6. Phase 4: Mock Video Interview & Technical Communication Architecture

### 6.1 Ephemeral Video Processing & Zero-Retention Privacy Lifecycle
```
[Student Browser]
       │
       │ (1) User grants explicit consent and tests Camera & Mic
       ▼
[Interactive Studio Room]
       │
       │ (2) 5-Minute Strategy Prep (Briefing, Audience, Scratchpad)
       │ (3) Up to 7-Minute Timed Presentation (MediaRecorder chunks)
       ▼
[Next.js Server API: POST /api/communication/upload]
       │
       │ (4) Writes temporary video stream to isolated temp storage
       ▼
[Evaluation Pipeline]
  ├── Multimodal Analysis (Gemini 2.5 Flash via @google/genai)
  └── Speech Analytics (WPM cadence, filler words regex, grammar & structure)
       │
       │ (5) Deletion Lifecycle Triggered in try/catch/finally block
       ▼
[Ephemeral Storage Purge]
  • Immediately unlinks & permanently deletes temporary video file
  • Stamps `videoDeletedAt = new Date()` in database
       │
       │ (6) Stores structured scorecard (scores, feedback, WPM) in DB
       ▼
[Verifiable Scorecard Receipt]
  • Displays overall score (0–100), 5-category breakdown, and WPM
  • Includes cryptographically verified zero-retention deletion timestamp
```

1. **Zero-Retention Guarantee:** Video recordings are strictly ephemeral artifacts. Temporary streams are unlinked and permanently erased immediately upon scoring. Only structured rubric scores, speech metrics, and textual feedback are persisted.
2. **Informed Consent & Pre-Flight Testing:** Students must verify camera and microphone inputs and provide explicit informed consent before entering any presentation room.
3. **Accent, Demographic & Hardware Neutrality:** System prompts and heuristic algorithms explicitly forbid penalties for regional, international, or ethnic accents, skin tone, clothing, lighting artifacts, or webcam resolution. Pseudoscience (micro-expression emotion detection, lie detection) is strictly banned.

### 6.2 5-Dimension Evaluation Rubric & Normalization

$$\text{Overall Score} = \begin{cases} 
\text{Content} + \text{Clarity} + \text{Grammar} + \text{Pace} + \text{VisualDelivery} & \text{if visual feed is reliable (max 100)} \\
\text{Round}\left(\frac{\text{Content} + \text{Clarity} + \text{Grammar} + \text{Pace}}{80} \times 100\right) & \text{if visual feed is degraded or audio-only}
\end{cases}$$

* **Passing Threshold:** 60% (60/100).
* **Category 1: Content & Structure (0–20 pts):** Introduction framing, problem articulation, architectural trade-offs, and concluding summary.
* **Category 2: Clarity & Vocabulary (0–20 pts):** Precision of technical engineering terminology, conciseness, and jargon explanation.
* **Category 3: Grammar & Syntax (0–20 pts):** Sentence structure, professional tense, and transitional cohesion.
* **Category 4: Pace & Filler Words (0–20 pts):**
  * Speaking cadence: Optimal (110–165 WPM), Acceptable (90–110 or 165–185 WPM), Suboptimal (<90 or >185 WPM).
  * Verbal filler density: Pattern matching for *um, uh, er, ah, like, you know, basically, actually, literally, sort of, kind of, i mean*.
* **Category 5: Visual Delivery (0–20 pts):** Natural camera orientation and posture stability. Automatically excluded with normalized scoring if lighting or camera feed is unavailable or degraded.

### 6.3 Dual Evaluator Engine & Fallback Guarantee
1. **Primary: Gemini 2.5 Flash (`@google/genai`):** When `GEMINI_API_KEY` is present, executes structured multimodal evaluation with strict ethical directives.
2. **Fallback: Heuristic Speech & Transcript Analyzer:** When offline, in testing environments, or when API limits are reached, seamlessly executes deterministic rule-based linguistic and pacing analysis. Always truthfully labeled in the scorecard.


