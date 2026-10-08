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
