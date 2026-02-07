import type { ChatPayload, AgentAnswer } from "../../types/api";

/**
 * Price agent – uses search API for price/compare, then builds answer.
 * TODO: wire search API and build response.
 */
export async function runPrice(payload: ChatPayload): Promise<AgentAnswer> {
  void payload;
  return { content: "[Price] Not implemented yet." };
}
