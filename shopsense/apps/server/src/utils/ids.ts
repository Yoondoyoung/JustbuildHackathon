import { createHash } from "crypto";

export function stableHash(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex").slice(0, 32);
}

export function cacheKey(
  query: string,
  locale: string,
  filters: Record<string, unknown>,
  sort: string,
  maxResultsPerSource: number
): string {
  const payload = JSON.stringify({ query, locale, filters, sort, maxResultsPerSource });
  return stableHash(payload);
}
