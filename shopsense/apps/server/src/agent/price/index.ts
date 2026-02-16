import type { ChatPayload, AgentAnswer } from "../../types/api";
import { aggregateSearch } from "../../services/orchestrator";
import type { ProductItem } from "../../types/search";
import { tokenize } from "../../utils/text";
import { openai } from "../../providers/llm";
import { env } from "../../config/env";

function toQuery(payload: ChatPayload): string {
  if (payload.searchQuery?.trim()) {
    return payload.searchScope === "comparison"
      ? payload.searchQuery.trim()
      : payload.searchQuery.trim();
  }
  const n = payload.normalized;
  const parts = [n?.brand, n?.model, n?.title].filter(Boolean);
  return parts.join(" ").trim() || payload.question.trim();
}

/** Token overlap (Jaccard) between two strings; use to keep results similar to current product. */
function titleSimilarity(a: string, b: string): number {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (setA.size === 0 && setB.size === 0) return 1;
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** Prefer results that match the current product title so we compare like-for-like. */
function filterByProductRelevance(items: ProductItem[], currentTitle: string | undefined): ProductItem[] {
  if (!currentTitle || currentTitle.trim().length < 3) return items;
  const minSimilarity = 0.2;
  const relevant = items.filter((item) => titleSimilarity(currentTitle, item.title) >= minSimilarity);
  return relevant.length >= 2 ? relevant : items;
}

/** Keep only results whose price is within 50% of current product price (avoid half-price or double-price variants). */
function filterByPriceRange(
  items: ProductItem[],
  currentPrice: number | undefined
): ProductItem[] {
  if (currentPrice == null || currentPrice <= 0) return items;
  const minRatio = 0.5;
  const maxRatio = 1.5;
  const low = currentPrice * minRatio;
  const high = currentPrice * maxRatio;
  const inRange = items.filter((item) => {
    const amount = item.price?.amount;
    return amount != null && amount >= low && amount <= high;
  });
  return inRange.length >= 2 ? inRange : items;
}

function searchResultsToContext(items: ProductItem[]): string {
  return items
    .slice(0, 12)
    .map((item, i) => {
      const price = item.price;
      const priceStr =
        price?.amount != null ? `${price.amount.toFixed(2)} ${price.currency ?? "USD"}` : "no price";
      return `${i + 1}. title: ${item.title}\n   source: ${item.source}\n   price: ${priceStr}\n   url: ${item.url ?? ""}`;
    })
    .join("\n\n");
}

const PRICE_SYSTEM_PROMPT = `You are a shopping assistant. Answer the user's question about price using ONLY the search results data below.
- Use only facts from the search results (prices, store names, URLs). Do not invent data.
- Choose the answer format that best fits the question (e.g. short summary, comparison, list with links).
- Include product URLs when helpful so the user can click through. Keep your answer clear and concise.`;

async function answerFromSearchResults(question: string, searchContext: string): Promise<string> {
  if (!env.OPENAI_API_KEY?.trim()) {
    return "";
  }
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: PRICE_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Search results (use this data to answer):\n\n${searchContext}\n\n---\n\nUser question: ${question}\n\nAnswer (use only the data above; include URLs where useful):`,
        },
      ],
      max_tokens: 800,
    });
    const text = completion.choices[0]?.message?.content?.trim();
    return text ?? "";
  } catch {
    return "";
  }
}

function fallbackFormat(items: ProductItem[]): string {
  const top = items.slice(0, 5);
  const amounts = top.map((p) => p.price?.amount ?? 0).filter((x) => x > 0);
  const min = amounts.length ? Math.min(...amounts) : 0;
  const max = amounts.length ? Math.max(...amounts) : 0;
  const range =
    amounts.length > 0 ? `Price range from search: ${min.toFixed(2)}–${max.toFixed(2)} USD.\n\n` : "";
  const lines = top.map((item) => {
    const p = item.price;
    const priceStr = p?.amount != null ? `${p.amount.toFixed(2)} ${p.currency ?? "USD"}` : "—";
    return `• ${item.title} (${item.source}) — ${priceStr}\n  ${item.url ?? ""}`;
  });
  return range + lines.join("\n\n");
}

/**
 * Price agent: run search API, then let AI form the answer from the search response.
 */
export async function runPrice(payload: ChatPayload): Promise<AgentAnswer> {
  const query = toQuery(payload);
  if (!query) {
    return { content: "I can't look up prices without a product name. Please provide the product name." };
  }

  const response = await aggregateSearch(
    {
      query,
      locale: "US",
      maxResultsPerSource: 10,
      sort: "price_asc",
      condition: "new",
    },
    { requestId: `price-${Date.now()}` }
  );

  const priced = response.results.filter((r) => r.price?.amount != null);
  if (priced.length === 0) {
    return { content: "We don't have enough price data from the search. Please try a different product name." };
  }

  const currentTitle = payload.normalized?.title ?? "";
  const currentPrice = payload.normalized?.price?.value;
  let comparable = filterByProductRelevance(priced, currentTitle);
  comparable = filterByPriceRange(comparable, currentPrice);
  const searchContext = searchResultsToContext(comparable);

  const aiAnswer = await answerFromSearchResults(payload.question, searchContext);
  const content = aiAnswer.length > 0 ? aiAnswer : fallbackFormat(comparable);

  return { content };
}
