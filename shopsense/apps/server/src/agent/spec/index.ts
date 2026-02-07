import type { ChatPayload, AgentAnswer } from "../../types/api";
import { aggregateSearch } from "../../services/orchestrator";
import { fetchProductDetail } from "../../services/product-detail";

function toQuery(payload: ChatPayload): string {
  const n = payload.normalized;
  const parts = [n?.brand, n?.model, n?.title].filter(Boolean);
  return parts.join(" ").trim() || payload.question.trim();
}

export async function runSpec(payload: ChatPayload): Promise<AgentAnswer> {
  const query = toQuery(payload);
  if (!query) {
    return { content: "제품명이 없어서 스펙을 조회할 수 없어요. 제품명을 알려주세요." };
  }

  const search = await aggregateSearch(
    { query, locale: "US", maxResultsPerSource: 6, sort: "relevance" },
    { requestId: `spec-${Date.now()}` }
  );
  const amazonTop = search.results.find((r) => r.source === "amazon" && r.sourceId);
  if (!amazonTop?.sourceId) {
    return { content: "Amazon 기준 스펙 정보를 찾기 어려워요. 다른 제품명으로 다시 시도해 주세요." };
  }

  const detail = await fetchProductDetail("amazon", amazonTop.sourceId, `spec-${Date.now()}`);
  const specs = detail.specifications ?? {};
  const about = detail.aboutItem ?? [];
  const specLines = Object.entries(specs)
    .slice(0, 8)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");
  const aboutLines = about.slice(0, 5).map((x) => `- ${x}`).join("\n");

  return {
    content: `주요 스펙:\n${specLines || "스펙 정보가 없어요."}\n\n제품 설명 요약:\n${aboutLines || "설명 정보가 없어요."}`,
  };
}
