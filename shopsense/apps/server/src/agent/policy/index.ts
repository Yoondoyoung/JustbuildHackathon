import type { ChatPayload, AgentAnswer } from "../../types/api";
import { braveWebSearch } from "../../connectors/brave";

function toProductQuery(payload: ChatPayload): string {
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

function toPolicyQuery(payload: ChatPayload): string {
  const productQuery = toProductQuery(payload);
  const domain = payload.normalized?.store_domain?.trim();
  const question = payload.question.toLowerCase();
  const discountHint =
    question.includes("student") ||
    question.includes("education") ||
    question.includes("discount") ||
    question.includes("pricing");
  const policyTerms = discountHint
    ? "student discount education pricing"
    : "return policy shipping warranty";
  if (domain) {
    return `${productQuery} ${policyTerms} site:${domain}`;
  }
  return `${productQuery} ${policyTerms}`;
}

export async function runPolicy(payload: ChatPayload): Promise<AgentAnswer> {
  const query = toPolicyQuery(payload);
  if (!query) {
    return { content: "I need a product name to check policy information." };
  }

  const results = await braveWebSearch(query, 5);
  if (results.length === 0) {
    return {
      content:
        "I couldn't find policy results. Please share the retailer or a more specific product name.",
    };
  }

  const lines = results
    .slice(0, 4)
    .map((r) => `- ${r.title} — ${r.url}`)
    .join("\n");

  return {
    content: `Shipping/return/warranty references:\n${lines}`,
  };
}
