import type { ChatPayload, AgentAnswer } from "../../types/api";
import { aggregateSearch } from "../../services/orchestrator";
import type { ProductItem } from "../../types/search";

function toQuery(payload: ChatPayload): string {
  const n = payload.normalized;
  const parts = [n?.brand, n?.model, n?.title].filter(Boolean);
  return parts.join(" ").trim() || payload.question.trim();
}

function formatItem(item: ProductItem): string {
  const amount = item.price?.amount;
  const currency = item.price?.currency ?? "USD";
  const priceText = amount != null ? `${amount.toFixed(2)} ${currency}` : "price unavailable";
  return `- ${item.title} (${item.source.toUpperCase()}) — ${priceText} — ${item.url}`;
}

export async function runGeneral(payload: ChatPayload): Promise<AgentAnswer> {
  const query = toQuery(payload);
  if (!query) {
    return { content: "질문이 너무 짧아서 답을 만들기 어려워요. 제품명을 알려주세요." };
  }

  const response = await aggregateSearch(
    { query, locale: "US", maxResultsPerSource: 5, sort: "relevance" },
    { requestId: `general-${Date.now()}` }
  );

  const top = response.results.slice(0, 3);
  if (top.length === 0) {
    return { content: "검색 결과가 없어요. 다른 키워드로 시도해 주세요." };
  }

  const lines = top.map(formatItem).join("\n");
  return { content: `관련 제품 검색 결과:\n${lines}` };
}
