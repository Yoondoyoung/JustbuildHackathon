import type { ChatPayload } from "../../types/api";
import { run as runOrchestrator } from "../orchestrator";

export async function runChat(
  payload: ChatPayload
): Promise<{ message: { role: "assistant"; content: string } }> {
  const { content } = await runOrchestrator(payload);
  return { message: { role: "assistant", content } };
}
