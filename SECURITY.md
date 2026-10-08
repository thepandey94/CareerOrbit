# CAREERORBIT — SECURITY & THREAT MITIGATION

## 1. Authentication & Password Security
* **Argon2id Hashing:** All user passwords are encrypted using Argon2id via `@node-rs/argon2`.
  * **Memory Cost:** 65,536 KB (64 MB)
  * **Time Cost:** 3 iterations
  * **Parallelism:** 1 thread
  * Resists GPU, FPGA, and ASIC brute-force cracking.
* **Password Policy:** Minimum 12 characters. Must include uppercase, lowercase, and numbers. Blocklisted against common breached passwords.
* **Plaintext Safety:** Plaintext passwords are never logged, stored in cookies, or returned in API responses.

## 2. Session Management
* **Stateless Sealed Cookies:** Uses `iron-session` with AES-256-GCM symmetric encryption.
* **Cookie Flags:**
  * `httpOnly: true` — Blocks client-side JavaScript access (prevents XSS token theft).
  * `secure: true` — Enforced in production over HTTPS.
  * `sameSite: "strict"` — Mitigates Cross-Site Request Forgery (CSRF).

## 3. OTP Cryptography & Rate Limiting
* **Cryptographic Generation:** 6-digit numeric OTPs generated with `crypto.randomInt(100000, 1000000)`.
* **Storage Hashing:** Stored as salted SHA-256 hashes (`sha256(salt:code)`).
* **Timing-Safe Verification:** Uses `crypto.timingSafeEqual` to prevent side-channel timing attacks.
* **Rate Limits:** Maximum 1 OTP request every 60 seconds per email.
* **Brute-Force Guard:** Maximum 5 failed verification attempts before the OTP is permanently invalidated.

## 4. Authorization & Server Guards
* **Server-Side Enforcement:** Every administrative endpoint (`/api/admin/*`) asserts `session.user.role === 'ADMIN'`. Non-admin sessions receive HTTP 403 Forbidden.
* **User ID Cooldown:** Server verifies `now() - user.userIdChangedAt >= 90 days`. Rejects premature changes with exact remaining cooldown days.
* **14-Day Deletion Lockdown:** Accounts with `accountStatus === 'PENDING_DELETION'` cannot log in to student roadmaps or assessments.

## 5. Secret Management
* **Zero Client Leaks:** All API keys (`DATABASE_URL`, `SESSION_SECRET`, `RESEND_API_KEY`, `ADMIN_SETUP_SECRET`, `GEMINI_API_KEY`) lack the `NEXT_PUBLIC_` prefix and are physically stripped from client-side bundles by Next.js.
* **Environment Validation:** `src/lib/env.ts` asserts presence and type validity on server startup using Zod.

## 6. Production Security Headers & Content Security Policy (CSP)
Configured in `next.config.ts`:
* **Strict-Transport-Security (HSTS):** `max-age=63072000; includeSubDomains; preload` enforces HTTPS exclusively.
* **X-Content-Type-Options:** `nosniff` prevents MIME type sniffing.
* **X-Frame-Options:** `DENY` prevents clickjacking.
* **Referrer-Policy:** `strict-origin-when-cross-origin` restricts referrer headers across origins.
* **Permissions-Policy:** `camera=(self), microphone=(self), geolocation=(), interest-cohort=()` restricts device hardware to explicit user consent in communication sessions and completely bans geolocation and FLoC tracking.
* **Content-Security-Policy (CSP):** Restricts script, style, image, font, and media sources to trusted origins (`'self'`, Google Gemini API, sandboxed execution endpoints). Frame ancestors are strictly set to `'none'`.

## 7. Ephemeral File Storage & Path Traversal Defense
* **Storage Key Sanitization:** `sanitizeStorageKey` strips directory traversal sequences (`../`, `..\`), slashes, and control characters, restricting keys strictly to alphanumeric characters and underscores.
* **Temporary Storage Isolation:** All ephemeral audio/video recordings reside in an isolated temporary directory outside the project web root (`os.tmpdir()/careerorbit_temp_recordings`).
* **Immediate Zero-Retention Unlinking:** Recordings are evaluated in-memory and permanently unlinked immediately upon completion (or in error handlers) via `deleteEphemeralRecording`.
* **Automatic Garbage Collector:** `purgeStaleRecordings` runs periodically to ensure files older than 30 minutes are purged even in the event of sudden server restarts.

## 8. File Upload Validation & Media Whitelisting
* **Strict MIME Whitelist:** `POST /api/communication/upload` strictly verifies uploaded media MIME types against `video/webm`, `video/mp4`, `video/ogg`, `audio/webm`, `audio/mp4`, `audio/wav`, and `audio/ogg`. Executable formats (`.exe`, `.sh`, `.php`, `.js`) or unrecognized binary streams are rejected with HTTP 415 Unsupported Media Type.
* **Payload Size Ceiling:** Maximum upload size is strictly capped at 50 MB (HTTP 413 Payload Too Large if exceeded).

## 9. Isolated Sandbox Execution & Hidden Test Protection
* **Host Isolation:** Arbitrary code submitted by students is never executed on the Next.js production server. Code is routed to isolated sandbox containers (Piston / Judge0) with strict resource limits and timeouts (5,000ms max).
* **Language Whitelist:** Only officially supported languages (**Java** and **Python**) are accepted; all other languages are rejected.
* **Hidden Test Case Sanitization:** When retrieving questions or running trial tests, hidden test case inputs and expected outputs are stripped on the server. The client browser only receives sample test cases.

## 10. Strict Cross-User Data Isolation
* **Ownership Verification:** Every API endpoint querying assessment results (`/api/technical/result/*`, `/api/aptitude/result/*`, `/api/communication/result/*`) verifies `record.userId === session.user.id`. Unauthorized attempts by User B to view or manipulate User A's attempts throw authorization errors and return HTTP 403/404.

## 11. Dependency Audit & Supply Chain Review
* **Transient Dependencies:** Audit flags on `micromatch`/`braces` and `mysql2` originate exclusively from dev-time tools (`eslint-config-next` and `@prisma/config`). These dev tools are not bundled in the client production runtime. Production PostgreSQL connections use the secure `@prisma/adapter-pg` driver.
