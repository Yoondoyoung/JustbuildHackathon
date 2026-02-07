import type { ChatPayload, AgentAnswer } from "../../types/api";
import { aggregateSearch } from "../../services/orchestrator";
import { fetchProductDetail } from "../../services/product-detail";
import { openai } from "../../providers/llm";

function toQuery(payload: ChatPayload): string {
  const n = payload.normalized;
  const parts = [n?.brand, n?.model, n?.title].filter(Boolean);
  return parts.join(" ").trim() || payload.question.trim();
}

type SpecQueryPlan = {
  query: string;
  spec_keys?: string[];
};

async function buildSpecQueryPlan(payload: ChatPayload): Promise<SpecQueryPlan> {
  const fallback = toQuery(payload);
  const context = {
    question: payload.question,
    normalized: payload.normalized
      ? {
          title: payload.normalized.title,
          brand: payload.normalized.brand,
          model: payload.normalized.model,
          key_specs: payload.normalized.key_specs,
        }
      : undefined,
    analyze: payload.analyze
      ? {
          title: payload.analyze.title,
          specs: payload.analyze.specs,
        }
      : undefined,
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You generate a concise ecommerce search query for Amazon product lookup and a short list of spec keys relevant to the user's question. Reply JSON only.",
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              task:
                "Create a short search query (5-10 words) to find the most relevant product on Amazon. Also list 3-8 relevant spec keys.",
              context,
            },
            null,
            2
          ),
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return { query: fallback };
    const parsed = JSON.parse(raw) as SpecQueryPlan;
    const query = parsed.query?.trim() || fallback;
    const spec_keys = Array.isArray(parsed.spec_keys)
      ? parsed.spec_keys.filter((k) => typeof k === "string" && k.trim()).map((k) => k.trim())
      : undefined;
    return { query, spec_keys };
  } catch {
    return { query: fallback };
  }
}

function shortTitle(title: string | undefined): string {
  const t = (title ?? "").trim();
  if (!t) return "Amazon product";
  return t.length > 60 ? `${t.slice(0, 57)}...` : t;
}

export async function runSpec(payload: ChatPayload): Promise<AgentAnswer> {
  const plan = await buildSpecQueryPlan(payload);
  const query = plan.query;
  if (!query) {
    return { content: "제품명이 없어서 스펙을 조회할 수 없어요. 제품명을 알려주세요." };
  }

  const analyzeSpecs = payload.analyze?.specs ?? payload.normalized?.key_specs;
  const hasAnalyzeSpecs = !!analyzeSpecs && Object.keys(analyzeSpecs).length > 0;

  const search = await aggregateSearch(
    { query, locale: "US", maxResultsPerSource: 8, sort: "relevance" },
    { requestId: `spec-${Date.now()}` }
  );
  const amazonResults = search.results.filter(
    (r) => r.source === "amazon" && r.sourceId
  );
  const topAmazon = amazonResults.slice(0, 3);

  if (!hasAnalyzeSpecs && topAmazon.length === 0) {
    return { content: "Amazon 기준 스펙 정보를 찾기 어려워요. 다른 제품명으로 다시 시도해 주세요." };
  }

  const compareDetails = await Promise.all(
    topAmazon.map((p) =>
      fetchProductDetail("amazon", p.sourceId!, `spec-${Date.now()}`)
    )
  );

  const compareItems = compareDetails.map((d) => ({
    title: shortTitle(d.title),
    url: d.url,
    specs: d.specifications ?? {},
  }));

  const currentTitle = shortTitle(
    payload.normalized?.title || payload.analyze?.title || "Current product"
  );
  const currentSpecs = hasAnalyzeSpecs ? (analyzeSpecs as Record<string, string>) : {};

  const allSpecKeys = new Set<string>();
  Object.keys(currentSpecs).forEach((k) => allSpecKeys.add(k));
  for (const item of compareItems) {
    Object.keys(item.specs).forEach((k) => allSpecKeys.add(k));
  }

  const preferredKeys =
    plan.spec_keys && plan.spec_keys.length > 0
      ? plan.spec_keys.filter((k) => allSpecKeys.has(k))
      : [];
  const remainingKeys = [...allSpecKeys].filter((k) => !preferredKeys.includes(k));
  const keyList = [...preferredKeys, ...remainingKeys].slice(0, 10);
  const header = ["Spec", currentTitle, ...compareItems.map((x) => x.title)].join(" | ");
  const divider = [":--", ...new Array(1 + compareItems.length).fill(":--")].join(" | ");
  const rows = keyList.map((k) => {
    const currentVal = currentSpecs[k] ?? "-";
    const compareVals = compareItems.map((x) => x.specs[k] ?? "-");
    return [k, currentVal, ...compareVals].join(" | ");
  });

  const table = [header, divider, ...rows].join("\n");
  const links = compareItems
    .map((x, i) => `- 비교 ${i + 1}: ${x.url ?? "URL 없음"}`)
    .join("\n");

  if (topAmazon.length === 0) {
    const specLines = Object.entries(currentSpecs)
      .slice(0, 8)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n");
    return {
      content: `Amazon 비교 대상이 없어서 현재 제품 스펙만 정리했어요:\n${specLines || "스펙 정보가 없어요."}`,
    };
  }

  return {
    content: `스펙 비교 (현재 제품 vs Amazon 상위 결과):\n${table}\n\n비교 대상 링크:\n${links || "비교 대상이 없어요."}`,
  };
}
