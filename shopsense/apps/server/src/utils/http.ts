import { env } from "../config/env";
import { SourceRequestError } from "./errors";

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function backoffWithJitter(attempt: number): number {
  const base = 250;
  const cap = 5000;
  const exp = Math.min(base * Math.pow(2, attempt), cap);
  const jitter = exp * 0.2 * (Math.random() * 2 - 1);
  return Math.round(exp + jitter);
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { method: "GET", signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function httpRequest<T>(
  source: "amazon" | "google" | "walmart",
  url: string,
  params: Record<string, string | number>
): Promise<T> {
  const query = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  const fullUrl = query ? `${url}?${query}` : url;

  let lastError: Error | null = null;
  const maxAttempts = env.RETRY_MAX + 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetchWithTimeout(fullUrl, env.PER_SOURCE_TIMEOUT_MS);
      if (res.ok) {
        return (await res.json()) as T;
      }

      const body = await res.text();
      const retryable = RETRYABLE_STATUS.has(res.status);
      if (attempt === maxAttempts - 1 || !retryable) {
        throw new SourceRequestError(
          source,
          String(res.status),
          body.slice(0, 200) || "Request failed",
          retryable
        );
      }
    } catch (err) {
      const retryable = err instanceof Error && err.name === "AbortError";
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === maxAttempts - 1 || !retryable) {
        throw new SourceRequestError(
          source,
          "REQUEST_FAILED",
          lastError.message,
          retryable
        );
      }
    }
    await delay(backoffWithJitter(attempt));
  }

  throw lastError ?? new SourceRequestError(source, "UNKNOWN", "Request failed", false);
}
