import { env } from "../config/env";
import { buildParams, serpSearch } from "./serpapi";
import type { SerpFilters } from "./serpapi";

export interface ConnectorContext {
  requestId: string;
}

function extractItems(data: Record<string, unknown>): unknown[] {
  const shopping = data.shopping_results as unknown[] | undefined;
  if (Array.isArray(shopping) && shopping.length > 0) return shopping;
  const organic = data.organic_results as unknown[] | undefined;
  if (Array.isArray(organic) && organic.length > 0) return organic;
  return [];
}

export async function search(
  query: string,
  locale: string,
  limit: number,
  filters: SerpFilters | undefined,
  _ctx: ConnectorContext
): Promise<unknown[]> {
  const params = buildParams(env.SERPAPI_ENGINE_WALMART, query, locale, limit, filters);
  const data = await serpSearch<Record<string, unknown>>("walmart", params);
  return extractItems(data);
}
