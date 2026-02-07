import { env } from '../config/env';
import { buildParams, serpSearch } from './serpapi.client';
import type { SerpFilters } from './serpapi.client';
import type { ProductItem } from '../schemas/search.schemas';

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
  if (env.MOCK_MODE) {
    return getMockResults(query, limit);
  }
  const params = buildParams(
    env.SERPAPI_ENGINE_AMAZON,
    query,
    locale,
    limit,
    filters
  );
  const data = await serpSearch<Record<string, unknown>>('amazon', params);
  return extractItems(data);
}

function getMockResults(_query: string, limit: number): unknown[] {
  const items: unknown[] = [];
  for (let i = 0; i < Math.min(limit, 5); i++) {
    items.push({
      title: `Amazon Product ${i + 1}`,
      link: `https://amazon.com/dp/mock${i + 1}`,
      thumbnail: `https://via.placeholder.com/150?text=A${i + 1}`,
      price: `$${19.99 + i * 10}`,
      rating: 4 + (i % 2) * 0.5,
      review_count: 100 + i * 50,
      extensions: ['Fast shipping', 'Prime eligible'],
    });
  }
  return items;
}
