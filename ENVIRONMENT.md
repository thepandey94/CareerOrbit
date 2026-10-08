# CAREERORBIT — ENVIRONMENT VARIABLE REFERENCE

This document lists all environment variables used by CareerOrbit, their purpose, format, and default behavior.

| Variable Name | Required | Default / Example Value | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/careerorbit?schema=public` | Primary PostgreSQL connection string with connection pooling. |
| `DIRECT_URL` | Optional | `postgresql://user:pass@host:5432/careerorbit?schema=public` | Direct database connection string (used by Prisma migrations). |
| `SESSION_SECRET` | Yes | *(Must be at least 32 characters)* | 32-byte secret used by `iron-session` to seal cookies via AES-256-GCM. |
| `RESEND_API_KEY` | Optional in dev | `re_123456789...` | API key from Resend (https://resend.com) for real OTP delivery. If omitted in development, OTPs are printed to terminal logs. |
| `EMAIL_FROM` | Yes | `CareerOrbit <onboarding@resend.dev>` | Verified sender email address used for transactional emails. |
| `ADMIN_SETUP_SECRET`| Yes | *(Random cryptographic string)* | Secret token used to provision the initial administrator at `/admin/setup`. |
| `NODE_ENV` | Yes | `development` / `production` / `test` | Runtime environment mode. Controls cookie `secure` flags and logging verbosity. |

---

## Setting Up Locally

Create a `.env.local` file in the project root:
```bash
cp .env.example .env.local
```

Fill in your PostgreSQL database credentials and generate a secure 32-byte session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Paste this string as your `SESSION_SECRET`.
