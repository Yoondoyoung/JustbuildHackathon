import type { ChatPayload, AgentAnswer } from "../../types/api";

/**
 * Spec agent – uses search API for specs, then builds answer.
 * TODO: wire search API and build response.
 */
export async function runSpec(payload: ChatPayload): Promise<AgentAnswer> {
  void payload;
  return { content: "[Spec] Not implemented yet." };
}
