import type { ChatPayload, AgentAnswer } from "../../types/api";

/**
 * Review agent – uses search API for reviews, then builds answer.
 * TODO: wire search API and build response.
 */
export async function runReview(payload: ChatPayload): Promise<AgentAnswer> {
  void payload;
  return { content: "[Review] Not implemented yet." };
}
