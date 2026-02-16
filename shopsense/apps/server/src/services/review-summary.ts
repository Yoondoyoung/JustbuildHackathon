import { env } from "../config/env";
import type { ReviewItem } from "../types/search";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export interface ProductInfoForReviews {
  title: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
}

export async function generateReviews(product: ProductInfoForReviews): Promise<ReviewItem[]> {
  if (!env.OPENAI_API_KEY) return [];
  const { title, description = "", rating, reviewCount } = product;
  const context = [
    `상품명: ${title}`,
    description ? `설명: ${description.slice(0, 500)}` : "",
    rating != null ? `평균 별점: ${rating}` : "",
    reviewCount != null ? `리뷰 수: ${reviewCount}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Write 5 short customer reviews for this product. Each review should be 1–3 sentences, in natural English.\n\n${context}\n\nReply with JSON array only. Each item: { "body": "review text", "rating": number(1-5), "author": "name" }. Example: [{"body":"...","rating":5,"author":"Alex"}]`,
        },
      ],
      max_tokens: 800,
    }),
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
  try {
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    const out: ReviewItem[] = [];
    for (const x of parsed.slice(0, 5)) {
      if (!x || typeof x !== "object") continue;
      const o = x as Record<string, unknown>;
      const body = typeof o.body === "string" ? o.body.trim() : "";
      if (!body) continue;
      out.push({
        body,
        rating: typeof o.rating === "number" ? o.rating : undefined,
        author: typeof o.author === "string" ? o.author.trim() : undefined,
      });
    }
    return out;
  } catch {
    return [];
  }
}

export async function summarizeReviews(reviewBodies: string[]): Promise<string | undefined> {
  if (!env.OPENAI_API_KEY || reviewBodies.length === 0) return undefined;
  const text = reviewBodies.join("\n\n").slice(0, 6000);
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Here are customer reviews. Summarize the key points in 2–4 concise English sentences.\n\n${text}`,
        },
      ],
      max_tokens: 300,
    }),
  });
  if (!res.ok) return undefined;
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content?.trim();
  return content || undefined;
}
