import type { ChatPayload, AgentAnswer } from "../../types/api";
import { aggregateSearch } from "../../services/orchestrator";
import type { ProductItem } from "../../types/search";
import { tokenize } from "../../utils/text";
import { openai } from "../../providers/llm";
import { env } from "../../config/env";

function toQuery(payload: ChatPayload): string {
  const n = payload.normalized;
  const parts = [n?.brand, n?.model, n?.title].filter(Boolean);
  return parts.join(" ").trim() || payload.question.trim();
}

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

function filterByProductRelevance(
  items: ProductItem[],
  currentTitle: string | undefined
): ProductItem[] {
  if (!currentTitle || currentTitle.trim().length < 3) return items;
  const minSimilarity = 0.2;
  const relevant = items.filter(
    (item) => titleSimilarity(currentTitle, item.title) >= minSimilarity
  );
  return relevant.length >= 2 ? relevant : items;
}

function filterByPriceRange(
  items: ProductItem[],
  currentPrice: number | undefined
): ProductItem[] {
  if (currentPrice == null || currentPrice <= 0) return items;
  const low = currentPrice * 0.5;
  const high = currentPrice * 1.5;
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
        price?.amount != null
          ? `${price.amount.toFixed(2)} ${price.currency ?? "USD"}`
          : "no price";
      const ratingStr =
        item.rating != null ? `, rating: ${item.rating}` : "";
      return `${i + 1}. title: ${item.title}\n   source: ${item.source}, price: ${priceStr}${ratingStr}\n   url: ${item.url ?? ""}`;
    })
    .join("\n\n");
}

const GENERAL_SYSTEM_PROMPT = `You are a shopping assistant. Answer the user's question about the product using ONLY the search results data below.
- Use only facts from the search results (titles, prices, ratings, store names, URLs). Do not invent data.
- Answer in a helpful, concise way. If the question is general (e.g. "what is this?", "is it good?"), summarize what you see from the results and include product URLs when useful.`;

async function answerFromSearchResults(
  question: string,
  searchContext: string
): Promise<string> {
  if (!env.OPENAI_API_KEY?.trim()) return "";
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: GENERAL_SYSTEM_PROMPT },
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
  const lines = top.map((item) => {
    const p = item.price;
    const priceStr =
      p?.amount != null ? `${p.amount.toFixed(2)} ${p.currency ?? "USD"}` : "—";
    return `• ${item.title} (${item.source}) — ${priceStr}\n  ${item.url ?? ""}`;
  });
  return `Related products from search:\n\n${lines.join("\n\n")}`;
}

/**
 * General agent: run search API, then let AI form the answer from the search response (same pattern as price agent).
 */
export async function runGeneral(payload: ChatPayload): Promise<AgentAnswer> {
  const query = toQuery(payload);
  if (!query) {
    return {
      content:
        "I need a product name or question to search. Please provide more context.",
    };
  }

  const response = await aggregateSearch(
    {
      query,
      locale: "US",
      maxResultsPerSource: 10,
      sort: "relevance",
    },
    { requestId: `general-${Date.now()}` }
  );

  if (response.results.length === 0) {
    return { content: "No search results found. Try a different query or product name." };
  }

  const currentTitle = payload.normalized?.title ?? "";
  const currentPrice = payload.normalized?.price?.value;
  let comparable = filterByProductRelevance(response.results, currentTitle);
  comparable = filterByPriceRange(comparable, currentPrice);

  const searchContext = searchResultsToContext(comparable);
  const aiAnswer = await answerFromSearchResults(payload.question, searchContext);
  const content =
    aiAnswer.length > 0 ? aiAnswer : fallbackFormat(comparable);

  return { content };
}
