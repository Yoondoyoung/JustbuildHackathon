import type { ChatPayload, AgentAnswer } from "../../types/api";
import { aggregateSearch } from "../../services/orchestrator";
import { fetchProductDetail } from "../../services/product-detail";
import { openai } from "../../providers/llm";

function toQuery(payload: ChatPayload): string {
  if (payload.searchQuery?.trim() && payload.searchScope === "comparison") {
    return payload.searchQuery.trim();
  }
  const n = payload.normalized;
  const parts = [n?.brand, n?.model, n?.title].filter(Boolean);
  if (payload.searchQuery?.trim()) {
    return [parts.join(" ").trim(), payload.searchQuery.trim()]
      .filter(Boolean)
      .join(" ")
      .trim();
  }
  return parts.join(" ").trim() || payload.question.trim();
}

function baseProductQuery(payload: ChatPayload): string {
  const n = payload.normalized;
  const parts = [n?.brand, n?.model, n?.title].filter(Boolean);
  return parts.join(" ").trim() || payload.question.trim();
}

type SpecQueryPlan = {
  query: string;
  spec_keys?: string[];
  category?: string;
};

const CATEGORY_KEYWORDS = [
  "tumbler",
  "water bottle",
  "bottle",
  "mug",
  "cup",
  "thermos",
  "flask",
  "headphones",
  "earbuds",
  "earphones",
  "speaker",
  "laptop",
  "monitor",
  "keyboard",
  "mouse",
  "chair",
  "desk",
];

function inferCategory(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const lower = text.toLowerCase();
  for (const key of CATEGORY_KEYWORDS) {
    if (lower.includes(key)) return key;
  }
  return undefined;
}

function normalizeTitleKey(title: string | undefined): string {
  return (title ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function buildSpecQueryPlan(payload: ChatPayload): Promise<SpecQueryPlan> {
  const fallback = toQuery(payload);
  const inferred =
    inferCategory(payload.question) ||
    inferCategory(payload.normalized?.title) ||
    inferCategory(payload.analyze?.title);
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
            "You generate a concise ecommerce search query for Amazon product comparison and a short list of spec keys relevant to the user's question. Also derive the product category (e.g., brand -> category). Reply JSON only.",
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              task:
                "Create a short search query (2-5 words) for finding alternative products in the same category (e.g., 'tumbler', 'noise cancelling headphones'). Also list 3-8 relevant spec keys and a single category word.",
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
    const parsed = JSON.parse(raw) as SpecQueryPlan & { category?: string };
    const category = typeof parsed.category === "string" ? parsed.category.trim() : "";
    const query = category || inferred || parsed.query?.trim() || fallback;
    const spec_keys = Array.isArray(parsed.spec_keys)
      ? parsed.spec_keys.filter((k) => typeof k === "string" && k.trim()).map((k) => k.trim())
      : undefined;
    return { query, spec_keys, category: category || inferred };
  } catch {
    return { query: inferred || fallback, category: inferred };
  }
}

function shortTitle(title: string | undefined): string {
  const t = (title ?? "").trim();
  if (!t) return "Amazon product";
  return t.length > 60 ? `${t.slice(0, 57)}...` : t;
}

function isSameProductTitle(
  candidateTitle: string,
  currentTitle?: string,
  currentBrand?: string,
  currentModel?: string
): boolean {
  const t = candidateTitle.toLowerCase();
  const brand = currentBrand?.toLowerCase();
  const model = currentModel?.toLowerCase();
  const title = currentTitle?.toLowerCase();

  if (brand && model && t.includes(brand) && t.includes(model)) return true;
  if (model && t.includes(model)) return true;
  if (title && title.length > 10 && t.includes(title)) return true;
  return false;
}

export async function runSpec(payload: ChatPayload): Promise<AgentAnswer> {
  const plan = await buildSpecQueryPlan(payload);
  const query =
    payload.searchScope === "comparison"
      ? plan.category || plan.query
      : baseProductQuery(payload);
  if (!query) {
    return { content: "I can't compare specs without a product name. Please share the product name." };
  }

  const analyzeSpecs = payload.analyze?.specs ?? payload.normalized?.key_specs;
  const hasAnalyzeSpecs = !!analyzeSpecs && Object.keys(analyzeSpecs).length > 0;

  console.log("[spec] search parameter:", query);
  const search = await aggregateSearch(
    { query, locale: "US", maxResultsPerSource: 12, sort: "relevance" },
    { requestId: `spec-${Date.now()}` }
  );
  console.log(
    "[spec] search results (titles):",
    search.results.slice(0, 10).map((r) => r.title)
  );
  const amazonResults = search.results.filter(
    (r) => r.source === "amazon" && r.sourceId
  );
  const currentTitleRaw = payload.normalized?.title || payload.analyze?.title;
  const currentBrand = payload.normalized?.brand;
  const currentModel = payload.normalized?.model;
  const filteredAmazon = amazonResults.filter(
    (r) =>
      !isSameProductTitle(
        r.title,
        currentTitleRaw,
        currentBrand,
        currentModel
      )
  );
  const uniqueByTitle = new Set<string>();
  const dedupedAmazon = (filteredAmazon.length > 0 ? filteredAmazon : amazonResults).filter(
    (r) => {
      const key = normalizeTitleKey(r.title);
      if (!key || uniqueByTitle.has(key)) return false;
      uniqueByTitle.add(key);
      return true;
    }
  );
  const topAmazon = dedupedAmazon.slice(0, 5);
  console.log(
    "[spec] filtered amazon results:",
    topAmazon.map((r) => ({ title: r.title, sourceId: r.sourceId }))
  );

  if (!hasAnalyzeSpecs && topAmazon.length === 0) {
    return { content: "I couldn't find comparable Amazon products. Try a different product name." };
  }

  let compareDetails = await Promise.all(
    topAmazon.map((p) =>
      fetchProductDetail("amazon", p.sourceId!, `spec-${Date.now()}`)
    )
  );
  compareDetails = compareDetails.filter(
    (d) => d.specifications && Object.keys(d.specifications).length > 0
  );
  console.log(
    "[spec] detail specs counts:",
    compareDetails.map((d) => ({
      title: d.title,
      specCount: d.specifications ? Object.keys(d.specifications).length : 0,
    }))
  );

  if (compareDetails.length < 2 && plan.category && plan.category !== query) {
    console.log("[spec] retrying with category-only query:", plan.category);
    const retrySearch = await aggregateSearch(
      { query: plan.category, locale: "US", maxResultsPerSource: 12, sort: "relevance" },
      { requestId: `spec-${Date.now()}` }
    );
    const retryAmazon = retrySearch.results.filter(
      (r) => r.source === "amazon" && r.sourceId
    );
    const retryDeduped = retryAmazon.filter((r) => {
      const key = normalizeTitleKey(r.title);
      if (!key || uniqueByTitle.has(key)) return false;
      uniqueByTitle.add(key);
      return true;
    });
    const retryTop = retryDeduped.slice(0, 5);
    const retryDetails = await Promise.all(
      retryTop.map((p) =>
        fetchProductDetail("amazon", p.sourceId!, `spec-${Date.now()}`)
      )
    );
    const retryWithSpecs = retryDetails.filter(
      (d) => d.specifications && Object.keys(d.specifications).length > 0
    );
    if (retryWithSpecs.length > compareDetails.length) {
      compareDetails = retryWithSpecs;
    }
  }

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
    .map((x, i) => `- Compare ${i + 1}: ${x.url ?? "URL not available"}`)
    .join("\n");

  if (topAmazon.length === 0) {
    const specLines = Object.entries(currentSpecs)
      .slice(0, 8)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n");
    return {
      content: `No comparable Amazon items found, so here are the current product specs:\n${specLines || "No spec data available."}`,
    };
  }

  return {
    content: `Spec comparison (current product vs top Amazon results):\n${table}\n\nComparison links:\n${links || "No comparison targets available."}`,
  };
}
