declare const chrome: any;

import type { AnalyzeResult, ChatResponse, Extracted } from "../shared/types";

const DEFAULT_API_BASE = "http://localhost:8787";

const getApiBase = async (): Promise<string> => {
  const result = await chrome.storage.sync.get("apiBase");
  if (typeof result.apiBase === "string" && result.apiBase.length > 0) {
    return result.apiBase;
  }
  return DEFAULT_API_BASE;
};

export const postAnalyze = async (extracted: Extracted): Promise<AnalyzeResult> => {
  const apiBase = await getApiBase();
  const response = await fetch(`${apiBase}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ extracted }),
  });

  if (!response.ok) {
    throw new Error(`Analyze failed: ${response.status}`);
  }

  return (await response.json()) as AnalyzeResult;
};

export const postChat = async (payload: {
  question: string;
  analyze?: AnalyzeResult;
  extracted?: Extracted;
}): Promise<ChatResponse> => {
  const apiBase = await getApiBase();
  const response = await fetch(`${apiBase}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Chat failed: ${response.status}`);
  }

  return (await response.json()) as ChatResponse;
};
