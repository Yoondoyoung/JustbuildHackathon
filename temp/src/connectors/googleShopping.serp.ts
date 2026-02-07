import { env } from '../config/env';
import { buildParams, serpSearch } from './serpapi.client';
import type { SerpFilters } from './serpapi.client';

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
    env.SERPAPI_ENGINE_GOOGLE_SHOPPING,
    query,
    locale,
    limit,
    filters
  );
  const data = await serpSearch<Record<string, unknown>>('google', params);
  return extractItems(data);
}

function getMockResults(_query: string, limit: number): unknown[] {
  const items: unknown[] = [];
  for (let i = 0; i < Math.min(limit, 5); i++) {
    items.push({
      title: `Google Shopping Product ${i + 1}`,
      link: `https://store.google.com/mock/${i + 1}`,
      thumbnail: `https://via.placeholder.com/150?text=G${i + 1}`,
      price: `$${29.99 + i * 5}`,
      extracted_price: 29.99 + i * 5,
      rating: 4.2,
      reviews: 200 + i * 30,
      extensions: ['Free delivery', '2-year warranty'],
    });
  }
  return items;
}
