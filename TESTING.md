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

## 3. Phase 1 Test Suites

| Test Suite | Purpose | Status |
| :--- | :--- | :--- |
| `tests/auth_registration_otp.test.ts` | Validates 6-digit cryptographic OTP generation, salted SHA-256 hashing, timing-safe verification, and attempt limits. | **Passing (5/5)** |
| `tests/auth_login_argon2.test.ts` | Validates password complexity rules, Argon2id hash formatting, and verification accuracy. | **Passing (5/5)** |
| `tests/auth_user_id_cooldown.test.ts` | Validates User ID regex format and 90-day cooldown elapsed calculations. | **Passing (2/2)** |
| `tests/auth_account_deletion.test.ts` | Validates 14-day grace period boundaries, active cancellation state, and purge readiness. | **Passing (3/3)** |
| `tests/admin_rbac_guard.test.ts` | Validates server-side role assertion, granting access to `ADMIN` and throwing HTTP 403 on non-admin roles. | **Passing (2/2)** |

**Total Phase 1 Tests:** 17 passed (100% pass rate).
