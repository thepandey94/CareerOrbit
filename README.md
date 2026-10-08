# CareerOrbit — AI-Assisted Career Preparation Platform

> **“Your journey. Your skills. Your career.”**

CareerOrbit is a production-grade, full-stack, AI-assisted career preparation platform built specifically for students. It guides aspiring developers and analysts through personalized roadmaps, verified skill gap diagnostics, timed technical coding rounds evaluated in an isolated sandbox, aptitude assessments, and video presentation evaluations.

---

## 🌟 Key Features

### Phase 1: Foundation
* **Robust Authentication & Security:**
  * Real email verification using 6-digit cryptographic OTPs with 10-minute expiry and rate-limiting.
  * OWASP-standard **Argon2id** password hashing (`@node-rs/argon2`, 64MB memory cost).
  * Dual login supporting either **Email + Password** or unique **User ID + Password**.
  * Stateless, encrypted, tamper-proof HTTP-only cookie sessions via **iron-session** (AES-256-GCM).
  * Enforced **90-day cooldown** on User ID changes with smart alternative suggestions if an ID is taken.
  * **14-day account deletion grace period** with immediate access locking and authenticated one-click cancellation.
* **Database & Persistence:**
  * **Prisma 7.10.0** with PostgreSQL driver adapter (`@prisma/adapter-pg`).
  * 11 comprehensive relational models covering users, roadmaps, curated resources, question banks, assessment attempts, code answers, communication presentations, and gamification state.
* **Modern Accessible Interface:**
  * Built with **Next.js 16.4.0 (App Router)** and **React 19.3.0**.
  * Coordinated, accessible light/dark theme system with persistent user preference.
* **Protected Administrative Control:**
  * Server-side role-based access control (RBAC) on `/admin/*` and administrative API routes.
  * Secure initial admin provisioning via an environment setup secret.

### Phase 2: Career Onboarding & Learning
* **Career Exploration & Compatibility Scoring:**
  * Side-by-side exploration of 3 core tracks: **Software Engineer**, **Web Developer**, and **Data Analyst**.
  * 6-dimension questionnaire exploring daily interests, problem-solving style, and technical curiosities.
  * Supported skill self-assessments across Java, Python, JavaScript, SQL, C++, and HTML/CSS.
  * Transparent 0–100 compatibility rubric with contributing factor explanations.
  * Guidance guarantee: Compatibility scores inform and mentor; low initial scores never block students from choosing any career track.
* **Diagnostic Baseline Assessment:**
  * Multi-skill baseline assessment identifying strengths and specific skill gaps without granting unearned stage skips.
* **Personalized 90-Minute Daily Roadmaps:**
  * Customized roadmap generator adhering strictly to a sustainable 90-minute daily preparation pace (35m learning, 35m practice, 20m assessment).
  * Flexible duration (8, 12, 16, 24 weeks) or specific target deadline with realistic workload warnings if compressed.
* **Prerequisite & Task Locking Engine:**
  * Sequential unlocking: Day 1 starts `AVAILABLE`; Day 2 remains `LOCKED` with explicit prerequisite explanation until Day 1 is completed.
  * Downstream tasks unlock automatically when daily assessments pass with $\ge 60\%$.
* **Hybrid Learning & Verified External Resources:**
  * In-app conceptual breakdowns and guided exercises.
  * Curated external resources with verification badges (MDN, Oracle Java Docs, Python.org, PostgreSQL docs, cppreference).
* **AI Study Tutor with Guardrails & Offline Fallback:**
  * Powered by **Google Gemini 2.5 Flash** (`@google/genai`) for Socratic conceptual explanations, analogies, and debugging assistance.
  * **Academic Integrity Guardrail:** Strictly refuses to reveal direct answers or cheat solutions during active assessments.
  * **Deterministic Offline Fallback:** Seamlessly serves rich, verified subject explanations and mentor tips when external AI is offline or API keys are unconfigured.

### Phase 3: Technical Round & Aptitude
* **Official Technical Interview Round:**
  * **25 Questions per Level:** 15 conceptual knowledge questions, 5 code-output / debugging questions, and 5 algorithmic coding problems.
  * **Equal Marks & No Negative Marking:** 1 mark per question (25 marks total), ensuring fair and transparent assessment.
  * **Timed 60-Minute Execution:** Continuous countdown timer with automatic submission on expiration.
  * **Multiple Coding Trials:** Students can run and refine coding solutions against sample test cases unlimited times while the timer runs; only the final submission is officially graded.
  * **Hidden Test-Case Protection:** Server evaluates against hidden test cases without ever leaking hidden inputs or outputs to client network requests.
  * **60% Passing Threshold:** 15/25 required to pass; provides topic-level competency breakdown and allows unlimited fresh retakes of equivalent difficulty upon failure.
* **Aptitude Assessment Module:**
  * **25 Questions:** 10 Quantitative Aptitude, 8 Logical Reasoning, and 7 Verbal Ability questions.
  * **45-Minute Timed Session:** Automatic submission on timeout with a 60% passing threshold.
  * **Weak-Topic Diagnostics:** Category-by-category breakdown and comprehensive step-by-step solutions for every question.
* **Isolated Sandboxed Execution (Java & Python):**
  * Official execution engine strictly supporting **Java** and **Python** via sandboxed environments (Piston / Judge0). Arbitrary code never runs on the Next.js host server.
  * **Standalone Code Playground:** Freeform Java/Python editor (`/playground`) with custom stdin support that does not impact assessment scores.

### Phase 4: Mock Video Interview & Communication Presentation
* **Interactive Presentation Studio (`/communication`):**
  * **5-Minute Strategic Preparation:** Structured scenario briefing with target audience expectations, key talking points checklist, and interactive notes scratchpad that stays visible during recording.
  * **Up to 7-Minute Timed Presentation:** Timed recording with framing guide, live microphone VU meter visualizer, and Web Speech API live transcription.
  * **Zero-Retention Ephemeral Privacy Lifecycle:** Video files are evaluated ephemerally and immediately, permanently deleted upon scoring. Only structured rubric scores, speech metrics, and textual feedback are persisted.
* **5-Dimension Equal-Weight Rubric (60% Passing Mark):**
  * **Content & Structure (20 pts):** Introduction, problem framing, architectural trade-offs, and concluding summary.
  * **Clarity & Technical Vocabulary (20 pts):** Precision of engineering terminology, conciseness, and jargon explanation.
  * **Grammar & Syntax (20 pts):** Sentence structure, professional tense, and transitional cohesion.
  * **Pace & Filler Words (20 pts):** Words per minute (WPM, optimal 110–165 WPM) and verbal filler detection (*um, uh, like, you know, basically, etc.*).
  * **Visual Delivery (20 pts):** Natural camera eye contact and posture stability. Automatically excluded with normalized scoring across remaining 4 categories if video feed is degraded or audio-only.
* **Ethical AI Evaluation Safeguards:**
  * Strict demographic, accent, and hardware neutrality: zero penalties for regional accents, skin tone, clothing, or webcam resolution.
  * Pseudoscience (micro-expression emotion detection, lie detection) is strictly banned.
  * Dual evaluation engine: Google Gemini 2.5 Flash (`@google/genai`) with truthful fallback to a deterministic heuristic speech and transcript analyzer.

### Phase 5: Dashboard, Progress Tracking & Gamification
* **Comprehensive Student Dashboard (`/dashboard`):**
  * **Composite Job-Readiness Score:** Weighted calculation using 40% Technical, 30% Aptitude, and 30% Communication.
  * **Strict Incomplete Rule:** If any required assessment is missing, displays score as `Incomplete` rather than falsely deflating scores by treating missing assessments as 0%. Provides direct CTAs to take missing assessments.
  * **Persistent Progress Tracking:** Displays completed levels, roadmap tasks, assessment history, and progress trends across sessions and devices.
  * **Weak Topic Diagnostics:** Automatically analyzes performance across assessments to highlight specific weak topics and generate personalized practice recommendations.
* **Progress & Gamification (Privacy-Preserved):**
  * **Flexible Streaks & Freeze Protection:** Compares UTC calendar days and automatically utilizes an available streak freeze for a 1-day absence, keeping students encouraged.
  * **9 Genuine Milestone Badges:** Awarded strictly on actual database activities (e.g. `First Step`, `Diagnostic Explorer`, `Knowledge Seeker`, `Code Warrior`, `Logic Master`, `Confident Speaker`, `Triple Crown`, `7-Day Habit`).
  * **Student Privacy:** No public profiles or leaderboards. All progress and metrics remain strictly private to the student.
* **Administrative Management Portal (`/admin`):**
  * **Platform Usage Analytics:** Real-time visibility into active users, career track distributions, completed roadmaps, and assessment pass rates.
  * **Question Review & Verification Pipeline:** Review AI-generated and pending questions (`PENDING`, `APPROVED`, `REJECTED`) with administrative verification notes before they enter the student question bank.
  * **Server-Side Authorization & Audit Trail:** Strict RBAC checks (`AdminService.requireAdmin`) and tamper-evident `AuditLog` persistence on all privileged administrative actions.

### Phase 6: Testing, Security Hardening & Deployment
* **Defense-in-Depth Security Hardening:**
  * **Production Security Headers:** Enforced via `next.config.ts` (HSTS max-age 2 years, CSP, X-Frame-Options: DENY, nosniff, strict-origin Referrer-Policy, Permissions-Policy).
  * **Path Traversal Sanitization:** `sanitizeStorageKey` neutralizes directory traversal sequences (`../`, `..\`) and dangerous characters in ephemeral storage keys.
  * **Media Upload MIME Whitelist:** `POST /api/communication/upload` strictly validates uploaded media against web video/audio formats and enforces a 50MB ceiling.
  * **Hidden Test Case Sanitization:** Hidden test case inputs and expected outputs are never returned to client requests, preventing inspection via browser developer tools.
  * **Strict Cross-User Data Isolation:** Assessment attempts and presentation scorecards enforce database-level user ownership checks (`record.userId === session.user.id`).
* **PWA & Offline Resilience:**
  * **W3C Web App Manifest (`/manifest.webmanifest`):** Configured via `src/app/manifest.ts` with standalone display, orbital brand icon, and custom theme colors.
  * **Accessible Offline Fallback (`/offline`):** Helpful interface informing students about local cached capabilities vs features requiring live internet connection.
* **Comprehensive Automated Verification:**
  * 25 automated test suites with 95 passing tests covering authentication, roadmaps, technical coding rounds, aptitude testing, speech presentation scoring, streaks, badges, admin review, and security hardening.

---

## 🏆 Hackathon Demo Prototype (Quickstart)

CareerOrbit has been configured as a polished, reliable **college hackathon prototype**. Evaluators and judges can run and test the complete platform locally without needing to provision external cloud databases, verify third-party email domains, or purchase API subscriptions.

### ⚡ 30-Second Quickstart

```bash
# 1. Install dependencies
npm.cmd install

# 2. Run the Next.js local server
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

### 🔑 Instant Demo Access

Visit [http://localhost:3000/login](http://localhost:3000/login) to access the **Hackathon Demo Access** panel:

1. **One-Click Demo Student (`student_orbit`):**
   * Pre-loaded with an active **Software Engineer** career track.
   * Day 1 & Day 2 roadmap progress with 50% milestone completion.
   * Completed Technical Round (88%), Aptitude (80%), and Communication Presentation (80%).
   * Job Readiness Score calculated at **83% (Tier: STRONG)** with 8 earned milestone badges.
2. **One-Click Demo Administrator (`admin_orbit`):**
   * Direct access to the `/admin` portal.
   * Real-time platform metrics, user activity, and question approval pipeline.
3. **Manual Login Credentials:**
   * **Student:** `student_orbit` (or `student@careerorbit.dev`) / `CareerOrbit@2026!`
   * **Admin:** `admin_orbit` (or `admin@careerorbit.dev`) / `CareerOrbit@Admin2026!`
4. **Interactive Registration Flow:**
   * Visit `/register` to test new account creation.
   * In Demo Mode, the registration screen displays an honest **Demo Mode Active** banner showing the generated 6-digit verification code with a single-click **Auto-fill Code** button (no simulated email claims).

---

### 🔍 Real vs. Simulated Features

| Feature | Status | Implementation Details |
| :--- | :--- | :--- |
| **Authentication & Sessions** | **Real** | OWASP Argon2id password hashing, iron-session (AES-256-GCM encrypted cookies), RBAC on admin routes. |
| **Email Verification** | **Simulated** | Transparent local verification flow. Generates and displays the exact 6-digit OTP in the UI with one-click autofill; never claims an email was dispatched. |
| **Local Persistence Fallback** | **Real & Resilient** | Connects to PostgreSQL/Neon when available; automatically falls back to an in-memory `demoStore` when offline so the app never crashes. |
| **Career Track Selection** | **Real** | Software Engineer, Web Developer, and Data Analyst exploration with dynamic compatibility scoring. |
| **Roadmap & Learning Engine** | **Real** | Sequential prerequisite unlocking, 90-minute daily schedule modules, and verified reference links. |
| **Technical Round (25 Qs)** | **Real** | Timed 60-minute countdown, multiple coding trials, hidden test-case validation, 60% passing mark. |
| **Aptitude Practice (25 Qs)** | **Real** | Quantitative, logical, and verbal reasoning modules with timers, scoring, and step-by-step explanations. |
| **Communication Skills** | **Real & Ethical** | In-browser media recording, live transcript display, and deterministic NLP speech rubric evaluation (WPM, filler words, technical vocabulary). |
| **Job-Readiness Score** | **Real** | Composite weighted algorithm (40% Technical, 30% Aptitude, 30% Communication) with strict incomplete rules. |
| **Gamification** | **Real** | Streak tracking, freeze protections, and 9 milestone badges tied to authentic activity. |
| **Admin Portal** | **Real** | Usage metrics, audit logging, and question bank verification pipeline (`/admin`). |

---

## 🚀 Standard & Production Setup (Optional)

### 1. Prerequisites
* **Node.js:** `v20.0.0` or higher (`v24.x` recommended).
* **npm:** `v10.x` or higher.
* **PostgreSQL (Optional for Demo):** Neon, Supabase, or local PostgreSQL.

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Update the values in `.env.local`:
```env
DEMO_MODE=true
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/careerorbit?schema=public"
SESSION_SECRET="careerorbit_session_secret_at_least_32_characters_super_secure!"
ADMIN_SETUP_SECRET="careerorbit_admin_initial_secret_change_in_production"
```
*(When `DEMO_MODE=true` is set, the application operates self-contained without demanding external infrastructure).*

### 3. Prisma Generation & Database Push (When using PostgreSQL)
Generate the Prisma 7 client:
```bash
npm.cmd run prisma:generate
```
Push the schema to your database when ready:
```bash
npx.cmd prisma db push
```

### 4. Running the Application
Start the development server:
```bash
npm.cmd run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Automated Tests

Run the Vitest test suite:
```bash
npm.cmd test
```
To run tests in interactive watch mode:
```bash
npx.cmd vitest
```

---

## 📁 Project Structure

```
├── prisma/
│   └── schema.prisma        # 11 relational database models & enums
├── src/
│   ├── app/                 # Next.js 16 App Router pages & API routes
│   │   ├── (auth)/          # Registration, login, and deletion flows
│   │   ├── admin/           # Administrative portal & setup
│   │   ├── api/             # Secure server-side API handlers
│   │   ├── profile/         # Student profile & User ID settings
│   │   ├── globals.css      # Design tokens & dark mode overrides
│   │   ├── layout.tsx       # Root layout with ThemeProvider & Navbar
│   │   └── page.tsx         # Public marketing & track landing page
│   ├── components/          # Reusable accessible UI components (Navbar, Footer, ThemeToggle)
│   └── lib/                 # Core server libraries
│       ├── auth/            # Argon2id hashing, OTP crypto, iron-session
│       ├── email/           # Resend email delivery & dev logging
│       ├── services/        # Business logic (AuthService, UserService, AdminService)
│       ├── db.ts            # PrismaClient singleton with adapter-pg
│       └── env.ts           # Zod environment variable validation
├── tests/                   # Automated Vitest integration test suites
├── prisma.config.ts         # Prisma 7 configuration file
└── vitest.config.mts        # Test runner configuration
```

---

## 📚 Documentation Links
* [Architecture Guide](ARCHITECTURE.md)
* [Database Schema & Constraints](DATABASE.md)
* [Security & Threat Mitigation](SECURITY.md)
* [Environment Variable Reference](ENVIRONMENT.md)
* [Deployment Guide](DEPLOYMENT.md)
* [Testing Strategy](TESTING.md)

