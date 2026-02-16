import type { ChatPayload } from "../types/api";
import { runGeneral } from "./general";

/**
 * Chat orchestrator (v2).
 *
 * Keep the same exported shape (`run`) so existing routes keep working.
 * For now, route all questions through the general agent.
 */
export async function run(payload: ChatPayload): Promise<{ content: string }> {
  const { content } = await runGeneral(payload);
  return { content: content || "No answer available." };
}
