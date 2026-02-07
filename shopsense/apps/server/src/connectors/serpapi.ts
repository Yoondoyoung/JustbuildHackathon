import { env } from "../config/env";
import { httpRequest } from "../utils/http";
import { SourceRequestError } from "../utils/errors";

export type SerpSource = "amazon" | "google" | "walmart";

export interface SerpFilters {
  priceMin?: number;
  priceMax?: number;
  condition?: "new" | "used" | "refurb";
}

const LOCALE_MAP: Record<string, { location?: string; gl?: string; hl?: string }> = {
  US: { location: "United States", gl: "us", hl: "en" },
  GB: { location: "United Kingdom", gl: "uk", hl: "en" },
  DE: { location: "Germany", gl: "de", hl: "de" },
  FR: { location: "France", gl: "fr", hl: "fr" },
};

export function buildParams(
  engine: string,
  query: string,
  locale: string,
  limit: number,
  filters?: SerpFilters
): Record<string, string | number> {
  const localeParams = LOCALE_MAP[locale] ?? LOCALE_MAP.US;
  const queryKey = engine === "amazon" ? "k" : engine === "walmart" ? "query" : "q";
  const params: Record<string, string | number> = {
    api_key: env.SERPAPI_API_KEY ?? "",
    engine,
    [queryKey]: query,
    num: limit,
    ...localeParams,
  };
  if (filters?.priceMin != null) params.price_min = filters.priceMin;
  if (filters?.priceMax != null) params.price_max = filters.priceMax;
  if (filters?.condition) params.condition = filters.condition;
  return params;
}

export async function serpSearch<T>(
  source: SerpSource,
  params: Record<string, string | number>
): Promise<T> {
  if (!env.SERPAPI_API_KEY) {
    throw new SourceRequestError(source, "MISSING_API_KEY", "SERPAPI_API_KEY is not set", false);
  }
  return httpRequest<T>(source, env.SERPAPI_BASE_URL, params);
}

export function buildProductDetailParams(asin: string): Record<string, string | number> {
  return {
    api_key: env.SERPAPI_API_KEY ?? "",
    engine: env.SERPAPI_ENGINE_AMAZON_PRODUCT,
    asin,
    device: "mobile",
  };
}
