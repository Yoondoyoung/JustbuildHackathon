import type { ChatPayload, AgentAnswer } from "../../types/api";

/**
 * General agent – for questions that don't match price/review/spec/policy.
 * TODO: wire search or LLM and build response.
 */
export async function runGeneral(payload: ChatPayload): Promise<AgentAnswer> {
  void payload;
  return { content: "[General] Not implemented yet." };
}
