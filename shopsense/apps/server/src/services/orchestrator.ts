import { nowISO, timer } from "../utils/time";
import { z } from "zod";
import { generateWithGemini } from "../agent/general/gemini";
import { deduplicate, computeFingerprint } from "./dedup";
import { sortProducts } from "./ranking";
import { getCached, setCached } from "./cache";
import { env } from "../config/env";
import type { SearchRequest, SearchResponse, ProductItem, SourceError } from "../types/search";

export interface OrchestratorContext {
  requestId: string;
}

function inferSourceFromUrl(url: string): "amazon" | "google" | "walmart" {
  const u = url.toLowerCase();
  if (u.includes("amazon.") || u.includes("amzn.")) return "amazon";
  if (u.includes("walmart.")) return "walmart";
  return "google";
}

function toFilters(req: SearchRequest): {
  priceMin?: number;
  priceMax?: number;
  condition?: "new" | "used" | "refurb";
} {
  const f: { priceMin?: number; priceMax?: number; condition?: "new" | "used" | "refurb" } = {};
  if (req.priceMin != null) f.priceMin = req.priceMin;
  if (req.priceMax != null) f.priceMax = req.priceMax;
  if (req.condition) f.condition = req.condition;
  return f;
}

const GeminiSearchItemSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  imageUrl: z.string().url().optional(),
  price: z
    .object({
      amount: z.number().positive(),
      currency: z.string().min(1).default("USD"),
    })
    .optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative().optional(),
  sellerName: z.string().min(1).optional(),
  // optional freeform hints
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  features: z.array(z.string()).optional(),
});

const GeminiSearchResponseSchema = z.object({
  items: z.array(GeminiSearchItemSchema),
});

async function geminiSearchToItems(req: SearchRequest): Promise<ProductItem[]> {
  const locale = req.locale ?? "US";
  const limitPerSource = req.maxResultsPerSource ?? 10;
  const maxTotal = Math.min(Math.max(limitPerSource, 1) * 3, 30);
  const filters = toFilters(req);

  const priceHint =
    filters.priceMin != null || filters.priceMax != null
      ? `Price range hint: ${filters.priceMin ?? "any"} to ${filters.priceMax ?? "any"}`
      : "";
  const conditionHint = filters.condition ? `Condition hint: ${filters.condition}` : "";

  const prompt = `Use Google Search to find shopping results for the query below and return ONLY valid JSON.

Query: ${req.query}
Locale: ${locale}
Max items: ${maxTotal}
Sort preference: ${req.sort ?? "relevance"}
${priceHint}
${conditionHint}

Return JSON with this exact shape:
{
  "items": [
    {
      "title": string,
      "url": string,
      "imageUrl": string (optional),
      "price": {"amount": number, "currency": string} (optional),
      "rating": number (0-5, optional),
      "reviewCount": number (optional),
      "sellerName": string (optional),
      "brand": string (optional),
      "model": string (optional),
      "features": [string] (optional)
    }
  ]
}

Rules:
- Include direct product or product listing URLs when possible.
- Prefer reputable merchants and include Amazon/Walmart when relevant.
- Do not invent prices/ratings; omit fields if unknown.
- Keep items unique and highly relevant to the query.`;

  const resp = await generateWithGemini(prompt, {
    schema: GeminiSearchResponseSchema,
    tools: [{ googleSearch: {} }],
  });

  const items = resp?.items ?? [];
  const out: ProductItem[] = [];
  for (const x of items) {
    if (!x?.title || !x?.url) continue;
    const source = inferSourceFromUrl(x.url);
    const item: ProductItem = {
      source,
      sourceId: undefined,
      title: x.title,
      brand: x.brand,
      model: x.model,
      price: x.price,
      listPrice: undefined,
      rating: x.rating,
      reviewCount: x.reviewCount,
      reviewSnippets: undefined,
      description: undefined,
      specifications: undefined,
      availability: "unknown",
      shipping: undefined,
      deliveryText: undefined,
      offers: undefined,
      boughtLastMonth: undefined,
      stock: undefined,
      badges: undefined,
      sellerName: x.sellerName,
      url: x.url,
      imageUrl: x.imageUrl,
      features: (x.features ?? []).filter((s) => typeof s === "string" && s.trim().length > 0),
      fingerprint: "",
      raw: undefined,
    };
    item.fingerprint = computeFingerprint(item);
    out.push(item);
  }
  return out.slice(0, maxTotal);
}

export async function aggregateSearch(
  req: SearchRequest,
  ctx: OrchestratorContext
): Promise<SearchResponse> {
  const filters = toFilters(req);
  const cacheParts = {
    query: req.query,
    locale: req.locale ?? "US",
    filters: {
      priceMin: req.priceMin,
      priceMax: req.priceMax,
      condition: req.condition,
    },
    sort: req.sort ?? "relevance",
    maxResultsPerSource: req.maxResultsPerSource ?? 10,
  };

  const cached = getCached(cacheParts);
  if (cached) {
    return cached;
  }

  const totalTimer = timer();
  const errors: SourceError[] = [];
  const warnings: string[] = [];
  const perSourceCounts: Record<"amazon" | "google" | "walmart", number> = {
    amazon: 0,
    google: 0,
    walmart: 0,
  };

  if (!env.GEMINI_API_KEY?.trim()) {
    warnings.push("GEMINI_API_KEY is not set. Gemini-based search is unavailable.");
  }

  let merged: ProductItem[] = [];
  const geminiItems = await geminiSearchToItems(req);
  merged = geminiItems;
  if (merged.length === 0) {
    warnings.push("No results returned from Gemini search.");
  }

  for (const item of merged) {
    perSourceCounts[item.source] = (perSourceCounts[item.source] ?? 0) + 1;
  }

  merged = deduplicate(merged);
  merged = sortProducts(merged, req.query, req.sort ?? "relevance");
  const results = merged;

  const latencyMs = totalTimer();
  const response: SearchResponse = {
    query: req.query,
    timestamp: nowISO(),
    results,
    meta: {
      requestId: ctx.requestId,
      latencyMs,
      perSourceCounts,
      errors,
      warnings,
    },
  };

  // Avoid caching empty results when Gemini is unavailable (e.g., missing API key),
  // otherwise we'd pin an empty cache until TTL.
  const canCache = Boolean(env.GEMINI_API_KEY?.trim()) && response.results.length > 0;
  if (canCache) {
    setCached(cacheParts, response);
  }
  return response;
}
