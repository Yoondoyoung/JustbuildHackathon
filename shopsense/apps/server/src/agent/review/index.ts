import type { ChatPayload, AgentAnswer } from "../../types/api";
import { aggregateSearch } from "../../services/orchestrator";
import { fetchProductDetail } from "../../services/product-detail";
import { braveWebSearch } from "../../connectors/brave";

function toQuery(payload: ChatPayload): string {
  const n = payload.normalized;
  const base = [n?.brand, n?.model, n?.title, payload.analyze?.title]
    .filter(Boolean)
    .join(" ")
    .trim();
  const param = payload.searchQuery?.trim();
  const scope = payload.searchScope ?? "product";
  if (scope === "comparison" && param) {
    return param;
  }
  if (base) {
    return base;
  }
  if (param) {
    return param;
  }
  return payload.question.trim();
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
    return { content: "I need a product name to check reviews. Please share the product name." };
  }

  const search = await aggregateSearch(
    { query, locale: "US", maxResultsPerSource: 6, sort: "relevance" },
    { requestId: `review-${Date.now()}` }
  );
  const amazonTop = search.results.find((r) => r.source === "amazon" && r.sourceId);

  if (!amazonTop?.sourceId) {
    return { content: "I couldn't find Amazon review data. Please try another product name." };
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
    ? `Review summary: ${reviewSummary}`
    : "I couldn't generate a review summary.";

  return {
    content: `${summaryText}\n\nSample reviews:\n${reviewLines || "No review data available."}\n\nPros/cons references:\n${consLines}`,
  };
}
