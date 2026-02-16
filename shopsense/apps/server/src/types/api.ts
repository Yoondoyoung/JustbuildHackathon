export type Citation = {
  title?: string;
  url: string;
  snippet?: string;
};

export type AnalyzeResult = {
  title?: string;
  summary?: string;
  key_points?: string[];
  specs?: Record<string, string>;
  price?: { value: number; currency: string };
  rating?: number;
  review_count?: number;
  citations?: Citation[];
  suggested_questions?: string[];
};

/** Categories for intent → agent routing */
export type AgentCategory = "price" | "review" | "spec" | "policy" | "general";

import type { NormalizedProduct } from "./normalized";

/** Payload passed to chat flow (orchestrator + agents) */
export type ChatPayload = {
  question: string;
  normalized?: NormalizedProduct;
  analyze?: AnalyzeResult;
  searchQuery?: string;
  searchScope?: "product" | "comparison";
};

/** Single agent output; orchestrator combines these */
export type AgentAnswer = { content: string };
