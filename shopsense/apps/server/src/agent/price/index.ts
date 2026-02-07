import type { ChatPayload, AgentAnswer } from "../../types/api";
import { aggregateSearch } from "../../services/orchestrator";
import type { ProductItem } from "../../types/search";

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

function formatPriceItem(item: ProductItem): string {
  const amount = item.price?.amount;
  const currency = item.price?.currency ?? "USD";
  const priceText = amount != null ? `${amount.toFixed(2)} ${currency}` : "price unavailable";
  const source = item.source.toUpperCase();
  return `- ${item.title} (${source}) — ${priceText} — ${item.url}`;
}

export async function runPrice(payload: ChatPayload): Promise<AgentAnswer> {
  const query = toQuery(payload);
  if (!query) {
    return { content: "I need a product name to check prices. Please share the product name." };
  }

  const response = await aggregateSearch(
    { query, locale: "US", maxResultsPerSource: 8, sort: "price_asc" },
    { requestId: `price-${Date.now()}` }
  );

  const priced = response.results.filter((r) => r.price?.amount != null);
  if (priced.length === 0) {
    return { content: "I couldn't find enough price data. Please try another product name." };
  }

  const top = priced.slice(0, 3);
  const amounts = priced.map((p) => p.price?.amount ?? 0).filter((x) => x > 0);
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);

  const summary =
    amounts.length > 0
      ? `Approximate price range: ${min.toFixed(2)}~${max.toFixed(2)} USD.`
      : "I couldn't calculate a price range.";

  const lines = top.map(formatPriceItem).join("\n");
  return { content: `${summary}\n\nTop price results:\n${lines}` };
}
