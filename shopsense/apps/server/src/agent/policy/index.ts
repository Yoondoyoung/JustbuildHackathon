import type { ChatPayload, AgentAnswer } from "../../types/api";

/**
 * Policy agent – uses search API for shipping/returns/etc., then builds answer.
 * TODO: wire search API and build response.
 */
export async function runPolicy(payload: ChatPayload): Promise<AgentAnswer> {
  void payload;
  return { content: "[Policy] Not implemented yet." };
}
