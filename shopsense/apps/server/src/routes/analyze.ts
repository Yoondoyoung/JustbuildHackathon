import { Hono } from "hono";
import { runAnalyze } from "../agent/analyze";
import type { NormalizedProduct } from "../types/normalized";

type ExtractedLike = {
  page_url: string;
  store_domain?: string;
  title?: string;
  brand?: string;
  model?: string;
  price?: { value: number; currency: string };
  rating?: number;
  review_count?: number;
  key_specs?: Record<string, string>;
  visible_reviews?: string[];
};

const toNormalized = (extracted: ExtractedLike): NormalizedProduct => ({
  page_url: extracted.page_url,
  store_domain: extracted.store_domain,
  title: extracted.title,
  brand: extracted.brand,
  model: extracted.model,
  price: extracted.price,
  rating: extracted.rating,
  review_count: extracted.review_count,
  key_specs: extracted.key_specs,
  visible_reviews: extracted.visible_reviews,
});

export const analyzeRoute = new Hono();

analyzeRoute.post("/", async (c) => {
  try {
    const body = await c.req.json<{
      normalized?: NormalizedProduct;
      extracted?: ExtractedLike;
    }>();

    const normalized: NormalizedProduct = body.normalized
      ? body.normalized
      : body.extracted
        ? toNormalized(body.extracted)
        : (await c.req.json()) as NormalizedProduct;

    if (!normalized?.page_url) {
      return c.json({ error: "Missing normalized or extracted payload" }, 400);
    }

    const result = await runAnalyze(normalized);
    return c.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: message }, 500);
  }
});
