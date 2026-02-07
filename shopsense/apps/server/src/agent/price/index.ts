import type { ChatPayload, AgentAnswer } from "../../types/api";
import { aggregateSearch } from "../../services/orchestrator";
import type { ProductItem } from "../../types/search";

function toQuery(payload: ChatPayload): string {
  const n = payload.normalized;
  const parts = [n?.brand, n?.model, n?.title].filter(Boolean);
  return parts.join(" ").trim() || payload.question.trim();
}

function formatPriceItem(item: ProductItem): string {
  const amount = item.price?.amount;
  const currency = item.price?.currency ?? "USD";
  const priceText = amount != null ? `${amount.toFixed(2)} ${currency}` : "price unavailable";
  const source = item.source.toUpperCase();
  return `- ${item.title} (${source}) — ${priceText} — ${item.url}`;
}

/**
 * Price agent flow:
 * 1. Receive payload (question + normalized product info)
 * 2. Run 3 search APIs in parallel via aggregateSearch: Amazon, Google Shopping, Walmart
 * 3. Use merged results to build answer: price range summary + top 3 items with links
 */
export async function runPrice(payload: ChatPayload): Promise<AgentAnswer> {
  const query = toQuery(payload);
  if (!query) {
    return { content: "I can't look up prices without a product name. Please provide the product name." };
  }

  const response = await aggregateSearch(
    { query, locale: "US", maxResultsPerSource: 8, sort: "price_asc" },
    { requestId: `price-${Date.now()}` }
  );

  const priced = response.results.filter((r) => r.price?.amount != null);
  if (priced.length === 0) {
    return { content: "We don't have enough price data from the search. Please try a different product name." };
  }

  const top = priced.slice(0, 3);
  const amounts = priced.map((p) => p.price?.amount ?? 0).filter((x) => x > 0);
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);

  const summary =
    amounts.length > 0
      ? `The price range is approximately ${min.toFixed(2)}–${max.toFixed(2)} USD.`
      : "Unable to calculate the price range.";

  const lines = top.map(formatPriceItem).join("\n");
  return { content: `${summary}\n\nRecommended price info:\n${lines}` };
}
