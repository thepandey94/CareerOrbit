# CAREERORBIT — DEPLOYMENT & HOSTING GUIDE

## 1. Hosting Architecture Recommendations
* **Frontend & API:** Vercel Pro (production) or Render Web Service / Railway.
* **Database:** Neon Serverless PostgreSQL or Supabase.
* **Object Storage:** Cloudflare R2 (for zero egress fees).

## 2. Production Deployment Steps (Vercel)

1. Push your repository to GitHub.
2. Link the repository on the Vercel dashboard.
3. Configure the environment variables in Vercel Project Settings:
   * `DATABASE_URL`
   * `SESSION_SECRET`
   * `RESEND_API_KEY`
   * `EMAIL_FROM`
   * `ADMIN_SETUP_SECRET`
   * `NODE_ENV="production"`
4. Set the Build Command:
   ```bash
   prisma generate && next build
   ```
5. Deploy the application.

## 3. Database Migration Deployment
Run Prisma migrations against the production database:
```bash
npx prisma migrate deploy
```

## 4. Initial Administrator Provisioning
1. After deployment, navigate to `https://your-domain.com/admin/setup`.
2. Enter the secret defined in `ADMIN_SETUP_SECRET`.
3. Enter your administrator details and password.
4. Once created, self-provisioning is permanently disabled.

## 5. Database Connection Pooling & High Availability
In serverless environments (e.g. Vercel), each incoming serverless function invocation can open a direct database connection. Direct connection exhaustion must be avoided:
* **Neon Serverless PostgreSQL:** Use the pooled connection string (port `5432` with `-pooler` suffix in host). Neon's built-in PgBouncer pooler efficiently handles hundreds of concurrent serverless lambdas.
* **Supabase PostgreSQL:** Use the transaction pooler connection string (port `6543`).
* **Connection String Parameters:** Ensure `?pgbouncer=true&connection_limit=10` is appended when using PgBouncer pooling.

## 6. Database Backups & Point-In-Time Recovery (PITR)
* **Automated Daily Backups:** Enabled by default on managed PostgreSQL providers (Neon / Supabase) with 7 to 30 days of retention.
* **Point-in-Time Recovery (PITR):** Enables restoring the database to any millisecond within the retention window in the event of catastrophic data corruption.
* **Manual Cold Backup Command:**
  ```bash
  pg_dump -h <host> -U <user> -d careerorbit -F c -b -v -f careerorbit_backup_$(date +%Y%m%d).dump
  ```
* **Restore Command:**
  ```bash
  pg_restore -h <host> -U <user> -d careerorbit -v careerorbit_backup_YYYYMMDD.dump
  ```

## 7. External Service Dependencies, Usage Limits & Estimated Costs

| Service | Role | Free Tier Allowance | Production Pro Tier | Estimated Monthly Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Vercel** | Next.js Server & Edge Hosting | 100 GB bandwidth, unlimited personal projects | $20 / team member / month | **$0–$20/mo** |
| **Neon PostgreSQL** | Serverless relational database | 0.5 GiB storage, 1 project, auto-suspend | $19 / mo (10 GiB storage, PITR, 24/7 compute) | **$0–$19/mo** |
| **Resend** | Transactional OTP Email Delivery | 3,000 emails / mo (100 / day) | $20 / mo (50,000 emails / mo) | **$0–$20/mo** |
| **Google Gemini API** | AI Tutor & Multimodal Evaluation | 15 RPM, 1,500 requests / day (Free tier) | $0.075 / 1M input tokens (Gemini 2.5 Flash) | **$0–$5/mo** |
| **Piston / Judge0** | Java & Python Sandbox Execution | Public API (Free, rate-limited) | Self-hosted Docker container on small VPS | **$0–$6/mo** |
| **Total Estimated Cost** | Complete CareerOrbit Platform | Supported on 100% Free Tiers for low traffic | Full Production Scaled Stack | **$0 – $50/mo** |

## 8. Post-Deployment Smoke Testing Checklist
After deploying a new release, execute the following smoke verification tests:
1. **Health & Database Check:** Visit `/api/admin/stats` to verify database connectivity.
2. **Authentication Check:** Register a test account or request an OTP at `/register`. Verify OTP email delivery via Resend.
3. **Session Check:** Log in using both Email and unique User ID. Verify persistent cookie session.
4. **Dashboard Check:** Navigate to `/dashboard` and verify 40/30/30 Job-Readiness Score card renders correctly.
5. **Code Execution Sandbox:** Visit `/playground` and run both sample Python and Java scripts to verify sandbox runner status.
6. **Communication Studio:** Visit `/communication`, grant camera permissions, record a short 35-second test presentation, and confirm instant evaluation and ephemeral deletion.
7. **PWA Installability:** Open Chrome DevTools > Application > Manifest to confirm valid PWA metadata and install icon.

## 9. Rollback & Disaster Recovery Procedures
* **Zero-Downtime Rollback (Vercel):**
  1. Open Vercel Project Dashboard > Deployments.
  2. Locate the previous stable deployment SHA.
  3. Click **"Instant Rollback"** (promotes the previous deployment in < 2 seconds without rebuilding).
* **Database Schema Rollback:**
  * If a migration failed or caused regressions:
    ```bash
    npx prisma migrate resolve --rolled-back <migration_name>
    ```
  * Or restore a snapshot point from Neon/Supabase management console.

> [!IMPORTANT]
> **Safety & Approval Gate:** Do not execute live production migrations, deploy publicly, or trigger paid subscriptions without explicit human authorization.

