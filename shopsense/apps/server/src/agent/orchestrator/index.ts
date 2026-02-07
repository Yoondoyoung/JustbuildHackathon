import type { ChatPayload, AgentAnswer, AgentCategory } from "../../types/api";
import { openai } from "../../providers/llm";
import { runPrice } from "../price";
import { runReview } from "../review";
import { runSpec } from "../spec";
import { runPolicy } from "../policy";
import { runGeneral } from "../general";
import { runResponseEditor } from "../response";

const VALID_CATEGORIES: AgentCategory[] = [
  "price",
  "review",
  "spec",
  "policy",
  "general",
];

const CLASSIFY_PROMPT = `You classify a shopper's question about a product into one or more categories, propose a short search parameter string to use for API calls, decide whether the question is about the current product or about comparison/alternatives, and decide if price-search should be skipped in favor of policy/general (e.g., student discounts or education pricing).

Categories:
- price: price, discount, comparison, cost, value for money
- review: reviews, ratings, what others say, durability, quality feedback
- spec: specifications, features, dimensions, tech specs, options (e.g. color, size)
- policy: shipping, return, refund, warranty, guarantee

Reply with JSON only: { "categories": ["category1", "category2"], "parameter": "short search query", "scope": "product" | "comparison", "skip_price": true|false }
Use one or more of: price, review, spec, policy. If the question fits none of these, use ["general"].
The parameter should be a short query (2-6 words) that helps find relevant products.
Use scope="comparison" if the user asks for alternatives, comparisons, other options, or "better than" type questions. Otherwise scope="product".
Set skip_price=true if the user is asking about student/education discounts or general promotions where web/policy sources are more appropriate than price listings.

Input pitfalls to handle:
- Missing product name (e.g., "Is it good?") → parameter should be a generic category (e.g., "laptop", "tumbler") if possible.
- Ambiguous pronouns ("this", "it", "that") → assume current product; avoid unrelated categories.
- Multiple products in one question → choose comparison scope and parameter as the shared category (e.g., "tablets").
- Typos or slang → normalize to the most likely product/category.
- Non-product questions (policies, warranty) → policy category with retailer/site keywords if present.
- Accessory questions (e.g., "Apple Pencil support") → spec category; parameter should include product + accessory keyword.
- Pure opinion/fit questions ("good for gaming") → review or general; parameter should include product category + intent keyword.
- Keep parameter product-focused; do NOT output random brands or unrelated items.`;

/** Classify question into one or more categories. Returns ["general"] when none apply. */
export async function classify(
  question: string
): Promise<{
  categories: AgentCategory[];
  parameter?: string;
  scope?: "product" | "comparison";
  skipPrice?: boolean;
}> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: CLASSIFY_PROMPT },
        { role: "user", content: question },
      ],
      response_format: { type: "json_object" },
      max_tokens: 100,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return { categories: ["general"] };

    const parsed = JSON.parse(raw) as {
      categories?: string[];
      parameter?: string;
      scope?: string;
      skip_price?: boolean;
    };
    const list = parsed.categories;
    if (!Array.isArray(list) || list.length === 0) {
      return { categories: ["general"], parameter: parsed.parameter };
    }

    const filtered = list.filter((c): c is AgentCategory =>
      VALID_CATEGORIES.includes(c as AgentCategory)
    );
    const unique = [...new Set(filtered)];
    const categories =
      (unique.length > 0 ? unique : (["general"] as AgentCategory[])) as AgentCategory[];
    const parameter =
      typeof parsed.parameter === "string" && parsed.parameter.trim()
        ? parsed.parameter.trim()
        : undefined;
    const scope =
      parsed.scope === "comparison" || parsed.scope === "product"
        ? (parsed.scope as "product" | "comparison")
        : undefined;
    const skipPrice = parsed.skip_price === true ? true : undefined;
    return { categories, parameter, scope, skipPrice };
  } catch {
    return { categories: ["general"] };
  }
}

const AGENT_RUNNERS: Record<
  AgentCategory,
  (payload: ChatPayload) => Promise<AgentAnswer>
> = {
  price: runPrice,
  review: runReview,
  spec: runSpec,
  policy: runPolicy,
  general: runGeneral,
};

/**
 * Classify intent, run matching agents in parallel, combine answers.
 */
export async function run(payload: ChatPayload): Promise<{ content: string }> {
  const classified = await classify(payload.question);
  const categories = classified.categories;
  const effective = categories.length > 0 ? categories : (["general"] as const);
  const parameter = classified.parameter;
  const scope = classified.scope;
  const refined = classified.skipPrice
    ? effective.filter((c) => c !== "price")
    : effective;
  const finalCategories =
    refined.length > 0 ? refined : (["general"] as const);
  const mergedPayload = {
    ...payload,
    searchQuery: parameter ?? payload.searchQuery,
    searchScope: scope ?? payload.searchScope,
  };

  console.log("[orchestrator] question:", payload.question);
  console.log("[orchestrator] classified categories (agents to call):", finalCategories);
  console.log("[orchestrator] search parameter:", parameter ?? "none");
  console.log("[orchestrator] search scope:", scope ?? "product");

  const results = await Promise.all(
    finalCategories.map(async (cat) => {
      console.log("[orchestrator] calling agent:", cat);
      const res = await AGENT_RUNNERS[cat](mergedPayload);
      const preview =
        typeof res.content === "string" ? res.content.slice(0, 500) : "";
      console.log("[orchestrator] agent result:", {
        agent: cat,
        length: res.content?.length ?? 0,
        preview,
      });
      return res;
    })
  );

  const combined = results.map((r) => r.content).filter(Boolean).join("\n\n");
  console.log("[orchestrator] response editor draft length:", combined.length);
  const finalContent = await runResponseEditor(mergedPayload, combined);
  console.log("[orchestrator] response editor final preview:", finalContent.slice(0, 500));
  return { content: finalContent || combined || "No answer available." };
}
