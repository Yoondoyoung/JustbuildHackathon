import { LRUCache } from "lru-cache";
import { env } from "../config/env";
import { cacheKey } from "../utils/ids";
import type { SearchResponse } from "../types/search";

type CacheKeyParts = {
  query: string;
  locale: string;
  filters: Record<string, unknown>;
  sort: string;
  maxResultsPerSource: number;
};

function buildKey(parts: CacheKeyParts): string {
  return cacheKey(
    parts.query,
    parts.locale,
    parts.filters,
    parts.sort,
    parts.maxResultsPerSource
  );
}

const cache = new LRUCache<string, SearchResponse>({
  max: 500,
  ttl: env.CACHE_TTL_MS,
});

export function getCached(parts: CacheKeyParts): SearchResponse | undefined {
  return cache.get(buildKey(parts));
}

export function setCached(parts: CacheKeyParts, response: SearchResponse): void {
  cache.set(buildKey(parts), response);
}
