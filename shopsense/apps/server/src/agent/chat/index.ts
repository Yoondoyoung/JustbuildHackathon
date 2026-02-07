/**
 * Chat agent – to be implemented.
 * Will handle product Q&A using context (e.g. normalized data + analyze result).
 */
export async function runChat(_payload: {
  question: string;
  normalized?: unknown;
  analyze?: unknown;
}): Promise<{ message: { role: "assistant"; content: string } }> {
  return {
    message: { role: "assistant", content: "Chat agent not implemented yet." },
  };
}
