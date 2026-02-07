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

export async function runPrice(payload: ChatPayload): Promise<AgentAnswer> {
  const query = toQuery(payload);
  if (!query) {
    return { content: "제품명이 없어서 가격을 조회할 수 없어요. 제품명을 알려주세요." };
  }

  const response = await aggregateSearch(
    { query, locale: "US", maxResultsPerSource: 8, sort: "price_asc" },
    { requestId: `price-${Date.now()}` }
  );

  const priced = response.results.filter((r) => r.price?.amount != null);
  if (priced.length === 0) {
    return { content: "현재 검색된 가격 정보가 부족해요. 다른 제품명으로 다시 시도해 주세요." };
  }

  const top = priced.slice(0, 3);
  const amounts = priced.map((p) => p.price?.amount ?? 0).filter((x) => x > 0);
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);

  const summary =
    amounts.length > 0
      ? `가격 범위는 대략 ${min.toFixed(2)}~${max.toFixed(2)} USD 입니다.`
      : "가격 범위를 계산할 수 없어요.";

  const lines = top.map(formatPriceItem).join("\n");
  return { content: `${summary}\n\n추천 가격 정보:\n${lines}` };
}
