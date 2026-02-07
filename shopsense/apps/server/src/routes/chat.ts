import { Hono } from "hono";
import type { AnalyzeResult } from "../types/api";
import type { NormalizedProduct } from "../types/normalized";
import { runChat } from "../agent/chat";

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
  shipping_returns?: string;
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

export const chatRoute = new Hono();

chatRoute.post("/", async (c) => {
  try {
    const body = await c.req.json<{
      question?: string;
      analyze?: AnalyzeResult;
      extracted?: ExtractedLike;
      normalized?: NormalizedProduct;
    }>();

    const question = body.question?.trim() ?? "";
    if (!question) {
      return c.json({ error: "Missing question" }, 400);
    }

    const normalized =
      body.normalized ?? (body.extracted ? toNormalized(body.extracted) : undefined);

    console.log("[chat] incoming payload", {
      question,
      normalized,
      analyze: body.analyze,
      extracted: body.extracted,
    });

    const result = await runChat({
      question,
      normalized,
      analyze: body.analyze,
    });

    return c.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: message }, 500);
  }
});
