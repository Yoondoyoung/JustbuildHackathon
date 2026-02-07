import { nowISO, timer } from "../utils/time";
import { toSourceError } from "../utils/errors";
import * as amazonConnector from "../connectors/amazon.serp";
import * as googleConnector from "../connectors/googleShopping.serp";
import * as walmartConnector from "../connectors/walmart.serp";
import { normalize } from "./normalization";
import { deduplicate, computeFingerprint } from "./dedup";
import { sortProducts } from "./ranking";
import { getCached, setCached } from "./cache";
import type { SearchRequest, SearchResponse, ProductItem, SourceError } from "../types/search";

export interface OrchestratorContext {
  requestId: string;
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

  const connectorCtx = { requestId: ctx.requestId };
  const limit = req.maxResultsPerSource ?? 10;

  const [amazonResult, googleResult, walmartResult] = await Promise.allSettled([
    amazonConnector.search(req.query, req.locale ?? "US", limit, filters, connectorCtx),
    googleConnector.search(req.query, req.locale ?? "US", limit, filters, connectorCtx),
    walmartConnector.search(req.query, req.locale ?? "US", limit, filters, connectorCtx),
  ]);

  const rawAmazon = (amazonResult.status === "fulfilled" ? amazonResult.value : []) as unknown[];
  const rawGoogle = (googleResult.status === "fulfilled" ? googleResult.value : []) as unknown[];
  const rawWalmart = (walmartResult.status === "fulfilled" ? walmartResult.value : []) as unknown[];

  if (amazonResult.status === "rejected") {
    const se = toSourceError(amazonResult.reason);
    if (se) errors.push(se);
    else errors.push({ source: "amazon", code: "UNKNOWN", message: String(amazonResult.reason), retryable: false });
  }
  if (googleResult.status === "rejected") {
    const se = toSourceError(googleResult.reason);
    if (se) errors.push(se);
    else errors.push({ source: "google", code: "UNKNOWN", message: String(googleResult.reason), retryable: false });
  }
  if (walmartResult.status === "rejected") {
    const se = toSourceError(walmartResult.reason);
    if (se) errors.push(se);
    else errors.push({ source: "walmart", code: "UNKNOWN", message: String(walmartResult.reason), retryable: false });
  }

  const normalizeRaw = (raw: unknown[], source: "amazon" | "google" | "walmart"): ProductItem[] => {
    const items: ProductItem[] = [];
    for (const r of raw) {
      if (r != null && typeof r === "object" && !Array.isArray(r)) {
        const item = normalize(source, r as Record<string, unknown>);
        item.fingerprint = computeFingerprint(item);
        items.push(item);
      }
    }
    return items;
  };

  const amazonItems = normalizeRaw(Array.isArray(rawAmazon) ? rawAmazon : [], "amazon");
  const googleItems = normalizeRaw(Array.isArray(rawGoogle) ? rawGoogle : [], "google");
  const walmartItems = normalizeRaw(Array.isArray(rawWalmart) ? rawWalmart : [], "walmart");

  perSourceCounts.amazon = amazonItems.length;
  perSourceCounts.google = googleItems.length;
  perSourceCounts.walmart = walmartItems.length;

  let merged = [...amazonItems, ...googleItems, ...walmartItems];
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

  setCached(cacheParts, response);
  return response;
}
