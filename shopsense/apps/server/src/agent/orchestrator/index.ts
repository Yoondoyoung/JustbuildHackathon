import type { ChatPayload, AgentAnswer, AgentCategory } from "../../types/api";
import { openai } from "../../providers/llm";
import { runPrice } from "../price";
import { runReview } from "../review";
import { runSpec } from "../spec";
import { runPolicy } from "../policy";
import { runGeneral } from "../general";

const VALID_CATEGORIES: AgentCategory[] = [
  "price",
  "review",
  "spec",
  "policy",
  "general",
];

const CLASSIFY_PROMPT = `You classify a shopper's question about a product into one or more categories.

Categories:
- price: price, discount, comparison, cost, value for money
- review: reviews, ratings, what others say, durability, quality feedback
- spec: specifications, features, dimensions, tech specs, options (e.g. color, size)
- policy: shipping, return, refund, warranty, guarantee

Reply with JSON only: { "categories": ["category1", "category2"] }
Use one or more of: price, review, spec, policy. If the question fits none of these, use ["general"].`;

/** Classify question into one or more categories. Returns ["general"] when none apply. */
export async function classify(question: string): Promise<AgentCategory[]> {
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
    if (!raw) return ["general"];

    const parsed = JSON.parse(raw) as { categories?: string[] };
    const list = parsed.categories;
    if (!Array.isArray(list) || list.length === 0) return ["general"];

    const filtered = list.filter((c): c is AgentCategory =>
      VALID_CATEGORIES.includes(c as AgentCategory)
    );
    const unique = [...new Set(filtered)];
    return unique.length > 0 ? unique : ["general"];
  } catch {
    return ["general"];
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
  const categories = await classify(payload.question);
  const effective = categories.length > 0 ? categories : (["general"] as const);

  console.log("[orchestrator] question:", payload.question);
  console.log("[orchestrator] classified categories (agents to call):", effective);

  const results = await Promise.all(
    effective.map(async (cat) => {
      console.log("[orchestrator] calling agent:", cat);
      const res = await AGENT_RUNNERS[cat](payload);
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
  return { content: combined || "No answer available." };
}
