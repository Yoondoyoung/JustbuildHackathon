import type { ChatPayload, AgentAnswer } from "../../types/api";
import { braveWebSearch } from "../../connectors/brave";

function toProductQuery(payload: ChatPayload): string {
  const n = payload.normalized;
  const parts = [n?.brand, n?.model, n?.title].filter(Boolean);
  return parts.join(" ").trim() || payload.question.trim();
}

function toPolicyQuery(payload: ChatPayload): string {
  const productQuery = toProductQuery(payload);
  const domain = payload.normalized?.store_domain?.trim();
  if (domain) {
    return `${productQuery} return policy shipping warranty site:${domain}`;
  }
  return `${productQuery} return policy shipping warranty`;
}

export async function runPolicy(payload: ChatPayload): Promise<AgentAnswer> {
  const query = toPolicyQuery(payload);
  if (!query) {
    return { content: "정책 정보를 조회할 제품명이 없어요. 제품명을 알려주세요." };
  }

  const results = await braveWebSearch(query, 5);
  if (results.length === 0) {
    return {
      content:
        "정책 관련 검색 결과를 찾지 못했어요. 판매처/제품명을 조금 더 구체적으로 알려주세요.",
    };
  }

  const lines = results
    .slice(0, 4)
    .map((r) => `- ${r.title} — ${r.url}`)
    .join("\n");

  return {
    content: `배송/환불/보증 관련 참고 링크:\n${lines}`,
  };
}
