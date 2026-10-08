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
* **Zero Client Leaks:** All API keys (`DATABASE_URL`, `SESSION_SECRET`, `RESEND_API_KEY`, `ADMIN_SETUP_SECRET`) lack the `NEXT_PUBLIC_` prefix and are physically stripped from client-side bundles by Next.js.
