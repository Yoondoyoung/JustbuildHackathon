import type { ChatPayload, AgentAnswer } from "../../types/api";
import { braveWebSearch } from "../../connectors/brave";

function toQuery(payload: ChatPayload): string {
  if (payload.searchQuery?.trim() && payload.searchScope === "comparison") {
    return payload.searchQuery.trim();
  }
  const n = payload.normalized;
  const base = [n?.brand, n?.model, n?.title].filter(Boolean).join(" ").trim();
  const subject = base || payload.analyze?.title || "";
  const q = payload.question.trim();
  if (payload.searchQuery?.trim()) {
    return [subject, payload.searchQuery.trim()].filter(Boolean).join(" ").trim();
  }
  return [subject, q].filter(Boolean).join(" ").trim();
}

export async function runGeneral(payload: ChatPayload): Promise<AgentAnswer> {
  const query = toQuery(payload);
  if (!query) {
    return { content: "I need a clearer product name to answer. Please share it." };
  }

  const results = await braveWebSearch(query, 5);
  if (results.length === 0) {
    return { content: "No web results found. Please try different keywords." };
  }

  const lines = results
    .slice(0, 4)
    .map((r) => `- ${r.title} — ${r.url}`)
    .join("\n");
  return { content: `Relevant references:\n${lines}` };
}
