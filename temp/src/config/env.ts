import { z } from 'zod';

const envSchema = z.object({
  SERPAPI_API_KEY: z.string().min(1).optional(), // optional when MOCK_MODE=true
  SERPAPI_BASE_URL: z.string().url().default('https://serpapi.com/search.json'),
  SERPAPI_ENGINE_GOOGLE_SHOPPING: z.string().default('google_shopping'),
  SERPAPI_ENGINE_AMAZON: z.string().default('amazon'),
  SERPAPI_ENGINE_AMAZON_PRODUCT: z.string().default('amazon_product'),
  SERPAPI_ENGINE_WALMART: z.string().default('walmart'),
  PER_SOURCE_TIMEOUT_MS: z.coerce.number().int().min(1000).max(30000).default(6000),
  RETRY_MAX: z.coerce.number().int().min(0).max(5).default(2),
  CACHE_TTL_MS: z.coerce.number().int().min(0).default(1800000),
  DEBUG_RAW: z
    .string()
    .transform((v) => v === 'true' || v === '1')
    .default('false'),
  MOCK_MODE: z
    .string()
    .transform((v) => v === 'true' || v === '1')
    .default('false'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  OPENAI_API_KEY: z.string().min(1).optional(),
  /** Brave Search API key for "단점" web search per product (optional) */
  BRAVE_KEY: z.string().transform((s) => s?.trim() || undefined).optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Invalid env: ${msg}`);
  }
  const env = parsed.data;
  if (!env.MOCK_MODE && !env.SERPAPI_API_KEY) {
    throw new Error('SERPAPI_API_KEY is required when MOCK_MODE is not true');
  }
  return env;
}

export const env = loadEnv();
