# CareerOrbit — AI-Assisted Career Preparation Platform

> **“Your journey. Your skills. Your career.”**

CareerOrbit is a production-grade, full-stack, AI-assisted career preparation platform built specifically for students. It guides aspiring developers and analysts through personalized roadmaps, verified skill gap diagnostics, timed technical coding rounds evaluated in an isolated sandbox, aptitude assessments, and video presentation evaluations.

---

## 🌟 Key Features (Phase 1 Foundation)

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
  * Responsive navigation, semantic HTML, and zero fabricated testimonials or placement numbers.
* **Protected Administrative Control:**
  * Server-side role-based access control (RBAC) on `/admin/*` and administrative API routes.
  * Secure initial admin provisioning via an environment setup secret.

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
* **Node.js:** `v20.0.0` or higher (`v24.x` recommended).
* **npm:** `v10.x` or higher.
* **PostgreSQL:** A running PostgreSQL database (e.g. Neon, Supabase, or local PostgreSQL).

### 2. Installation
Clone the repository and install dependencies:
```bash
npm.cmd install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Update the values in `.env.local`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/careerorbit?schema=public"
SESSION_SECRET="careerorbit_session_secret_at_least_32_characters_super_secure!"
ADMIN_SETUP_SECRET="careerorbit_admin_initial_secret_change_in_production"
```
*(When `RESEND_API_KEY` is omitted during local development, verification OTPs are logged safely to the terminal console).*

### 4. Prisma Generation & Database Push
Generate the Prisma 7 client:
```bash
npm.cmd run prisma:generate
```
Push the schema to your database when ready:
```bash
npx.cmd prisma db push
```
To visually inspect and manage database records in your web browser:
```bash
npm.cmd run prisma:studio
```

### 5. Running the Application
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
