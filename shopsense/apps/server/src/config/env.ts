import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  PER_SOURCE_TIMEOUT_MS: z.coerce.number().int().min(1000).max(30000).default(6000),
  RETRY_MAX: z.coerce.number().int().min(0).max(5).default(2),
  CACHE_TTL_MS: z.coerce.number().int().min(0).default(1800000),
  DEBUG_RAW: z
    .string()
    .transform((v: string) => v === "true" || v === "1")
    .default("false"),
  MOCK_MODE: z
    .string()
    .transform((v: string) => v === "true" || v === "1")
    .default("false"),
  MOCK_ANALYZE: z
    .string()
    .transform((v: string) => v === "true" || v === "1")
    .default("false"),
  BRAVE_KEY: z.string().transform((s: string) => s?.trim() || undefined).optional(),
  PORT: z.coerce.number().int().min(1).max(65535).default(8787),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.errors
      .map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    throw new Error(`Invalid env: ${msg}`);
  }
  return parsed.data;
}

export const env = loadEnv();
