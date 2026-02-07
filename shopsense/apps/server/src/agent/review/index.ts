import type { ChatPayload, AgentAnswer } from "../../types/api";
import { aggregateSearch } from "../../services/orchestrator";
import { fetchProductDetail } from "../../services/product-detail";
import { braveWebSearch } from "../../connectors/brave";

function toQuery(payload: ChatPayload): string {
  const n = payload.normalized;
  const parts = [n?.brand, n?.model, n?.title].filter(Boolean);
  return parts.join(" ").trim() || payload.question.trim();
}

function toModelQuery(fullTitle: string | undefined): string {
  if (!fullTitle || typeof fullTitle !== "string") return "";
  const words = fullTitle.trim().split(/\s+/).filter(Boolean);
  const take = Math.min(words.length, 6);
  return words.slice(0, take).join(" ").trim();
}

export async function runReview(payload: ChatPayload): Promise<AgentAnswer> {
  const query = toQuery(payload);
  if (!query) {
    return { content: "제품명이 없어서 리뷰를 조회할 수 없어요. 제품명을 알려주세요." };
  }

  const search = await aggregateSearch(
    { query, locale: "US", maxResultsPerSource: 6, sort: "relevance" },
    { requestId: `review-${Date.now()}` }
  );
  const amazonTop = search.results.find((r) => r.source === "amazon" && r.sourceId);

  if (!amazonTop?.sourceId) {
    return { content: "Amazon 기준 리뷰 정보를 찾기 어려워요. 다른 제품명으로 다시 시도해 주세요." };
  }

  const detail = await fetchProductDetail("amazon", amazonTop.sourceId, `review-${Date.now()}`);
  const reviewSummary = detail.reviewsSummary?.trim();
  const reviewLines = detail.reviews
    .slice(0, 3)
    .map((r) => `- ${r.body}${r.rating ? ` (${r.rating}★)` : ""}`)
    .join("\n");

  const modelQuery = toModelQuery(detail.title ?? amazonTop.title);
  const consQuery = modelQuery ? `${modelQuery} pros and cons` : "";
  const consResults = consQuery ? await braveWebSearch(consQuery, 3) : [];
  const consLines =
    consResults.length > 0
      ? consResults.map((r) => `- ${r.title} — ${r.url}`).join("\n")
      : "관련 웹 검색 결과가 없어요.";

  const summaryText = reviewSummary
    ? `리뷰 요약: ${reviewSummary}`
    : "리뷰 요약을 생성할 수 없어요.";

  return {
    content: `${summaryText}\n\n대표 리뷰:\n${reviewLines || "리뷰 데이터가 없어요."}\n\n참고 (장단점 검색):\n${consLines}`,
  };
}
