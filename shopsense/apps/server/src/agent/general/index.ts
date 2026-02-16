import type { ChatPayload, AgentAnswer } from "../../types/api";
import { aggregateSearch } from "../../services/orchestrator";
import type { ProductItem } from "../../types/search";
import { tokenize } from "../../utils/text";
import { openai } from "../../providers/llm";
import { env } from "../../config/env";

type PageDecision = {
  canAnswer: boolean;
  answer?: string;
  searchQuery?: string;
};

function toQuery(payload: ChatPayload): string {
  if (payload.searchQuery?.trim() && payload.searchScope === "comparison") {
    return payload.searchQuery.trim();
  }
  const n = payload.normalized;
  const parts = [n?.brand, n?.model, n?.title].filter(Boolean);
  return parts.join(" ").trim() || payload.question.trim();
}

function titleSimilarity(a: string, b: string): number {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (setA.size === 0 && setB.size === 0) return 1;
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function filterByProductRelevance(
  items: ProductItem[],
  currentTitle: string | undefined
): ProductItem[] {
  if (!currentTitle || currentTitle.trim().length < 3) return items;
  const minSimilarity = 0.2;
  const relevant = items.filter(
    (item) => titleSimilarity(currentTitle, item.title) >= minSimilarity
  );
  return relevant.length >= 2 ? relevant : items;
}

function filterByPriceRange(
  items: ProductItem[],
  currentPrice: number | undefined
): ProductItem[] {
  if (currentPrice == null || currentPrice <= 0) return items;
  const low = currentPrice * 0.5;
  const high = currentPrice * 1.5;
  const inRange = items.filter((item) => {
    const amount = item.price?.amount;
    return amount != null && amount >= low && amount <= high;
  });
  return inRange.length >= 2 ? inRange : items;
}

function searchResultsToContext(items: ProductItem[]): string {
  return items
    .slice(0, 12)
    .map((item, i) => {
      const price = item.price;
      const priceStr =
        price?.amount != null
          ? `${price.amount.toFixed(2)} ${price.currency ?? "USD"}`
          : "no price";
      const ratingStr =
        item.rating != null ? `, rating: ${item.rating}` : "";
      const imageStr = item.imageUrl ? `\n   image: ${item.imageUrl}` : "";
      return `${i + 1}. title: ${item.title}\n   source: ${item.source}, price: ${priceStr}${ratingStr}${imageStr}\n   url: ${item.url ?? ""}`;
    })
    .join("\n\n");
}

const GENERAL_SYSTEM_PROMPT = `You are a shopping assistant. Answer the user's question about the product using ONLY the search results data below.
- Use only facts from the search results (titles, prices, ratings, store names, URLs). Do not invent data.
- Answer in a helpful, concise way. If the question is general (e.g. "what is this?", "is it good?"), summarize what you see from the results and include product URLs when useful.`;

const PAGE_ONLY_SYSTEM_PROMPT = `You are a shopping assistant. You will be given structured data extracted from the CURRENT product page (normalized data) and optionally an analysis summary.

Your job:
- Decide whether you can answer the user's question WELL using ONLY the provided page data.
- If you can, provide the best possible answer using ONLY that data.
- If you cannot, say you cannot and propose a good web search query to answer it.

Return valid JSON only with this shape:
{
  "canAnswer": boolean,
  "answer": string or null,
  "searchQuery": string or null
}

Rules:
- If canAnswer=true, answer must be non-empty and searchQuery must be null.
- If canAnswer=false, searchQuery must be non-empty and answer must be null.
- Do NOT invent facts not present in the page data.
- Be conservative: if the page data doesn't contain enough info (e.g. comparisons, alternatives, market pricing across stores, broader review consensus), choose canAnswer=false.`;

async function decideFromPageData(payload: ChatPayload): Promise<PageDecision> {
  if (!env.OPENAI_API_KEY?.trim()) {
    // Without OpenAI we cannot judge; fall back to external search.
    return { canAnswer: false, searchQuery: payload.question.trim() || "product search" };
  }

  const pageData = {
    normalized: payload.normalized ?? null,
    analyze: payload.analyze ?? null,
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: PAGE_ONLY_SYSTEM_PROMPT },
        {
          role: "user",
          content: `User question:\n${payload.question}\n\nPage data (use only this):\n${JSON.stringify(pageData, null, 2)}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 350,
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      return { canAnswer: false, searchQuery: payload.question.trim() || "product search" };
    }

    const parsed = JSON.parse(raw) as {
      canAnswer?: unknown;
      answer?: unknown;
      searchQuery?: unknown;
    };

    const canAnswer = parsed.canAnswer === true;
    const answer =
      typeof parsed.answer === "string" ? parsed.answer.trim() : "";
    const searchQuery =
      typeof parsed.searchQuery === "string" ? parsed.searchQuery.trim() : "";

    if (canAnswer) {
      return { canAnswer: true, answer: answer || "" };
    }
    return { canAnswer: false, searchQuery: searchQuery || payload.question.trim() || "product search" };
  } catch {
    return { canAnswer: false, searchQuery: payload.question.trim() || "product search" };
  }
}

async function answerFromSearchResults(
  question: string,
  searchContext: string
): Promise<string> {
  if (!env.OPENAI_API_KEY?.trim()) return "";
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: GENERAL_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Search results (use this data to answer):\n\n${searchContext}\n\n---\n\nUser question: ${question}\n\nAnswer (use only the data above; include URLs where useful):`,
        },
      ],
      max_tokens: 800,
    });
    const text = completion.choices[0]?.message?.content?.trim();
    return text ?? "";
  } catch {
    return "";
  }
}

function fallbackFormat(items: ProductItem[]): string {
  const top = items.slice(0, 5);
  const lines = top.map((item) => {
    const p = item.price;
    const priceStr =
      p?.amount != null ? `${p.amount.toFixed(2)} ${p.currency ?? "USD"}` : "—";
    const imagePart = item.imageUrl ? `\n  ![${item.title}](${item.imageUrl})` : "";
    return `• ${item.title} (${item.source}) — ${priceStr}${imagePart}\n  ${item.url ?? ""}`;
  });
  return `Related products from search:\n\n${lines.join("\n\n")}`;
}

/**
 * General agent: run search API, then let AI form the answer from the search response (same pattern as price agent).
 */
export async function runGeneral(payload: ChatPayload): Promise<AgentAnswer> {
  const question = payload.question.trim();
  if (!question) return { content: "Please provide a question." };

  const requestId = `general-${Date.now()}`;
  const decision = await decideFromPageData(payload);
  console.log("[general] decision", {
    requestId,
    canAnswerFromPage: decision.canAnswer,
    hasPageTitle: Boolean(payload.normalized?.title),
    hasPagePrice: payload.normalized?.price?.value != null,
  });
  if (decision.canAnswer && decision.answer?.trim()) {
    console.log("[general] used_page_answer", { requestId });
    return { content: decision.answer.trim() };
  }

  const query = (decision.searchQuery ?? "").trim() || toQuery(payload);
  if (!query) {
    return {
      content:
        "I need a product name or question to search. Please provide more context.",
    };
  }

  console.log("[general] trigger_gemini_search", { requestId, query });
  const response = await aggregateSearch(
    {
      query,
      locale: "US",
      maxResultsPerSource: 10,
      sort: "relevance",
    },
    { requestId }
  );

  if (response.results.length === 0) {
    console.log("[general] gemini_search_empty", {
      requestId,
      query,
      warnings: response.meta.warnings,
    });
    return { content: "I couldn't find enough info to answer. Try a different query or provide more details." };
  }

  console.log("[general] gemini_search_ok", {
    requestId,
    query,
    counts: response.meta.perSourceCounts,
    totalResults: response.results.length,
    latencyMs: response.meta.latencyMs,
  });

  const currentTitle = payload.normalized?.title ?? "";
  const currentPrice = payload.normalized?.price?.value;
  let comparable = filterByProductRelevance(response.results, currentTitle);
  comparable = filterByPriceRange(comparable, currentPrice);

  const searchContext = searchResultsToContext(comparable);
  const aiAnswer = await answerFromSearchResults(question, searchContext);
  const content = aiAnswer.length > 0 ? aiAnswer : fallbackFormat(comparable);

  return { content };
}
