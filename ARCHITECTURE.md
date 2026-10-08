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
* `src/lib/auth/*`: Security primitives. Password hashing (Argon2id), OTP generation, and session serialization.
* `src/lib/db.ts`: Database connection singleton. Manages connection pooling via driver adapter.
