import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  TOKEN_ENCRYPTION_SECRET: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
  INTERNAL_API_SECRET: z.string().min(1),
  POLAR_ACCESS_TOKEN: z.string().min(1),
  POLAR_WEBHOOK_SECRET: z.string().min(1),
  POLAR_PRODUCT_ID: z.string().min(1),
  POLAR_ENVIRONMENT: z.enum(["sandbox", "production"]).optional(),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

type Env = z.infer<typeof serverEnvSchema>;

let _env: Env | null = null;

function getEnv(): Env {
  if (_env) return _env;
  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.format();
    const missing = Object.entries(formatted)
      .filter(([key, value]) => key !== "_errors" && value && typeof value === "object" && "_errors" in value)
      .map(([key, value]) => `  ${key}: ${(value as { _errors: string[] })._errors.join(", ")}`)
      .join("\n");
    throw new Error(`Missing or invalid environment variables:\n${missing}`);
  }
  _env = result.data;
  return _env;
}

export const env: Env = new Proxy({} as Env, {
  get(_, prop: string) {
    return getEnv()[prop as keyof Env];
  },
});
