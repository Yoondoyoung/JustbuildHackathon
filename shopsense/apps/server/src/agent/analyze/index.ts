import { openai } from "../../providers/llm";
import type { AnalyzeResult } from "../../types/api";
import type { NormalizedProduct } from "../../types/normalized";

const SYSTEM_PROMPT = `You are a product analyst. Given structured product data, produce a short analysis and 3 suggested questions a shopper might ask about this product.

Output valid JSON only, with this shape (use null for missing fields):
{
  "title": "string or null",
  "summary": "string (2-4 sentences)",
  "key_points": ["string"],
  "specs": {"key": "value"},
  "price": {"value": number, "currency": "string"} or null,
  "rating": number or null,
  "review_count": number or null,
  "suggested_questions": ["question 1", "question 2", "question 3"]
}

Rules:
- Do not include citations. Keep summary concise and factual.
- suggested_questions must be exactly 3 short, natural questions (e.g. "Is this good value?", "What do reviews say about durability?") that a user could ask next.`;

const mockResult = (normalized: NormalizedProduct): AnalyzeResult => ({
  title: normalized.title,
  summary: `Summary of ${normalized.title ?? "this product"}. Good value with solid specs and positive reviews.`,
  key_points: [
    "Competitive pricing",
    "Good battery life and connectivity",
    "Positive customer feedback",
  ],
  specs: normalized.key_specs,
  price: normalized.price,
  rating: normalized.rating,
  review_count: normalized.review_count,
  suggested_questions: [
    "Is this good value for money?",
    "What do reviews say about durability?",
    "How does it compare to similar products?",
  ],
});

export async function runAnalyze(
  normalized: NormalizedProduct
): Promise<AnalyzeResult> {
  if (process.env.MOCK_ANALYZE === "1") {
    return mockResult(normalized);
  }

  const userContent = JSON.stringify(normalized, null, 2);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty response from model");
  }

  const parsed = JSON.parse(raw) as AnalyzeResult & {
    suggested_questions?: string[];
  };
  const questions = parsed.suggested_questions?.slice(0, 3).filter(Boolean) ?? [];
  return {
    title: parsed.title ?? normalized.title,
    summary: parsed.summary ?? "",
    key_points: parsed.key_points,
    specs: parsed.specs ?? normalized.key_specs,
    price: parsed.price ?? normalized.price,
    rating: parsed.rating ?? normalized.rating,
    review_count: parsed.review_count ?? normalized.review_count,
    suggested_questions: questions.length > 0 ? questions : undefined,
  };
}
