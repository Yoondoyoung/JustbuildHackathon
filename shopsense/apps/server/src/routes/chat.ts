import { Hono } from "hono";
import type { AnalyzeResult } from "../types/api";
import type { NormalizedProduct } from "../types/normalized";
import { runAnalyze } from "../agent/analyze";
import { run as runAgents } from "../agent/orchestrator";

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

    if (!normalized?.page_url) {
      return c.json({ error: "Missing normalized or extracted payload." }, 400);
    }

    let analyze = body.analyze;
    if (!analyze) {
      try {
        analyze = await runAnalyze(normalized);
      } catch (err) {
        console.warn("[chat] analyze failed, continuing without analyze", err);
      }
    }

    console.log("[chat] question -> orchestrator:", question);

    const result = await runAgents({
      question,
      normalized,
      analyze,
    });

    return c.json({
      message: { role: "assistant" as const, content: result.content },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: message }, 500);
  }
});
