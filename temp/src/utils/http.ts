import axios, { AxiosError, AxiosInstance } from 'axios';
import { env } from '../config/env';
import { SourceRequestError } from './errors';

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

function isRetryable(err: unknown): boolean {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    if (status && RETRYABLE_STATUS.has(status)) return true;
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') return true;
  }
  return false;
}

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

export async function httpRequest<T>(
  source: 'amazon' | 'google' | 'walmart',
  url: string,
  params: Record<string, string | number>
): Promise<T> {
  const client: AxiosInstance = axios.create({
    timeout: env.PER_SOURCE_TIMEOUT_MS,
    params,
    paramsSerializer: (p) => {
      return Object.entries(p)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&');
    },
  });

  let lastError: AxiosError | Error | null = null;
  const maxAttempts = env.RETRY_MAX + 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await client.get<T>(url);
      return res.data;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const axiosErr = err as AxiosError;
      const retryable = isRetryable(err);
      if (attempt === maxAttempts - 1 || !retryable) {
        const code = axiosErr.response?.status
          ? String(axiosErr.response.status)
          : axiosErr.code ?? 'REQUEST_FAILED';
        const message =
          axiosErr.response?.data?.error ?? axiosErr.message ?? 'Request failed';
        throw new SourceRequestError(
          source,
          code,
          typeof message === 'string' ? message : JSON.stringify(message),
          retryable
        );
      }
      await delay(backoffWithJitter(attempt));
    }
  }

  throw lastError ?? new SourceRequestError(source, 'UNKNOWN', 'Request failed', false);
}
