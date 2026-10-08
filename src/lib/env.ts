import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .default("postgresql://postgres:postgres@localhost:5432/careerorbit?schema=public"),
  DIRECT_URL: z.string().optional(),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters long")
    .default("careerorbit_session_secret_at_least_32_characters_super_secure!"),
  RESEND_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("CareerOrbit <onboarding@resend.dev>"),
  ADMIN_SETUP_SECRET: z.string().default("careerorbit_admin_initial_secret_change_in_production"),
  CODE_EXECUTION_ENGINE: z.enum(["piston", "judge0", "mock"]).default("piston"),
  PISTON_API_URL: z.string().default("https://emkc.org/api/v2/piston"),
  JUDGE0_API_URL: z.string().optional(),
  JUDGE0_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  ADMIN_SETUP_SECRET: process.env.ADMIN_SETUP_SECRET,
  CODE_EXECUTION_ENGINE: process.env.CODE_EXECUTION_ENGINE,
  PISTON_API_URL: process.env.PISTON_API_URL,
  JUDGE0_API_URL: process.env.JUDGE0_API_URL,
  JUDGE0_API_KEY: process.env.JUDGE0_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
});

export type Env = z.infer<typeof envSchema>;
