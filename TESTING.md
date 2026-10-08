# CAREERORBIT — TESTING STRATEGY & TEST SUITE

## 1. Testing Framework
* **Runner:** Vitest (`v5.x`) with native TypeScript support and `@/*` alias resolution.
* **Environment:** Node.js runtime.

## 2. Test Execution Commands

Run all tests once:
```bash
npm.cmd test
```

Run tests in watch mode during development:
```bash
npx.cmd vitest
```

## 3. Test Suites & Coverage Matrix

### Phase 1: Foundation Suites
| Test Suite | Purpose | Status |
| :--- | :--- | :--- |
| `tests/auth_registration_otp.test.ts` | Validates 6-digit cryptographic OTP generation, salted SHA-256 hashing, timing-safe verification, and attempt limits. | **Passing (5/5)** |
| `tests/auth_login_argon2.test.ts` | Validates password complexity rules, Argon2id hash formatting, and verification accuracy. | **Passing (5/5)** |
| `tests/auth_user_id_cooldown.test.ts` | Validates User ID regex format and 90-day cooldown elapsed calculations. | **Passing (2/2)** |
| `tests/auth_account_deletion.test.ts` | Validates 14-day grace period boundaries, active cancellation state, and purge readiness. | **Passing (3/3)** |
| `tests/admin_rbac_guard.test.ts` | Validates server-side role assertion, granting access to `ADMIN` and throwing HTTP 403 on non-admin roles. | **Passing (2/2)** |

### Phase 2: Career Onboarding & Learning Suites
| Test Suite | Purpose | Status |
| :--- | :--- | :--- |
| `tests/career_compatibility_scoring.test.ts` | Validates transparent compatibility scoring weights, bounds [0, 100], factor derivations, and guidance disclaimers. | **Passing (5/5)** |
| `tests/roadmap_generator_timeline.test.ts` | Validates 90-minute daily workload distributions, 12-week schedule projections, and compressed deadline warning logic. | **Passing (3/3)** |
| `tests/roadmap_prerequisite_lock.test.ts` | Validates initial Day 1 unlocking, sequential prerequisite enforcement on Day 2, and automatic unlock propagation upon module completion. | **Passing (4/4)** |
| `tests/assessment_scoring_threshold.test.ts` | Validates 60% passing threshold arithmetic (3/5 passes, 2/5 fails) and multi-skill diagnostic gap analysis. | **Passing (2/2)** |
| `tests/ai_tutor_guardrail.test.ts` | Validates conceptual guidance, strict refusal during active assessments/exam cheating queries, and deterministic verified-content fallback. | **Passing (5/5)** |

### Phase 3: Technical Round & Aptitude Suites
| Test Suite | Purpose | Status |
| :--- | :--- | :--- |
| `tests/code_execution_engine.test.ts` | Validates isolated sandbox execution for Python and Java, strict rejection of unsupported languages, timeout bounds, and hidden test-case protection (inputs/outputs never leaked). | **Passing (5/5)** |
| `tests/technical_round_scoring.test.ts` | Validates 25-question distribution (15 conceptual, 5 debugging/output, 5 coding), equal marks (1 mark each), no negative marking, 60% passing threshold (15/25), and topic-level weak area detection. | **Passing (4/4)** |
| `tests/aptitude_module_scoring.test.ts` | Validates 25 timed questions (10 Quantitative, 8 Logical, 7 Verbal), equal marks, no negative marking, 60% passing threshold, and section breakdown calculations. | **Passing (3/3)** |
| `tests/assessment_timer_expiration.test.ts` | Validates 60m/45m timer calculation, automatic transition to EXPIRED upon timeout, and multiple coding trial attempts during active testing while only final submission counts. | **Passing (3/3)** |

### Phase 4: Mock Video Interview & Communication Presentation Suites
| Test Suite | Purpose | Status |
| :--- | :--- | :--- |
| `tests/communication_scoring_rubric.test.ts` | Validates equal 20-point weighting across 5 categories, normalized scoring over 4 categories when visual delivery is excluded/unreliable, 60% passing threshold (59 fails, 60 passes), and score boundary clamping. | **Passing (4/4)** |
| `tests/communication_speech_metrics.test.ts` | Validates quantitative speaking cadence (WPM) across durations, cadence tier classifications (Optimal: 110–165 WPM), comprehensive verbal filler detection regex (*um, uh, like, you know, etc.*), and filler density tier scoring. | **Passing (4/4)** |
| `tests/communication_privacy_lifecycle.test.ts` | Validates ephemeral temporary recording storage, verifiable immediate unlinking and deletion, `videoDeletedAt` timestamp generation, and automatic stale file garbage collection. | **Passing (3/3)** |
| `tests/communication_duration_limits.test.ts` | Validates 5-minute preparation period (300s) and up to 7-minute presentation duration (420s), topic registry catalog integrity, multimodal evaluator pipeline, and audio-only fallback normalization. | **Passing (3/3)** |

---

## 4. Current Test Results
* **Test Files:** 18 passed (18 total)
* **Total Assertions/Tests:** 65 passed (65 total)
* **Success Rate:** **100%**
* **Verification Command:** `npm.cmd test`

