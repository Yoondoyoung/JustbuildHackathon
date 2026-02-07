export type Msg =
  | { type: "ANALYZE_CLICK"; tabId?: number }
  | { type: "CHAT_SEND"; tabId?: number; question: string }
  | { type: "PANEL_INIT"; tabId: number }
  | { type: "GET_TAB_ID" }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "CHECK_AUTH" }
  | { type: "SIGN_IN"; email: string; password: string }
  | { type: "SIGN_UP"; email: string; password: string }
  | { type: "CHECK_PREFERENCES" }
  | { type: "GET_PREFERENCES" }
  | { type: "SAVE_PREFERENCES"; preferences: UserPreferences };

export type UserPreferences = {
  price: "budget" | "value" | "premium" | "flexible" | null;
  quality: "high" | "balanced" | "basic" | null;
  brand: "loyal" | "explorer" | "none" | null;
  sustainability: "eco" | "low" | null;
  reviews: "high" | "medium" | "low" | null;
  innovation: "early" | "wait" | "conservative" | null;
};

export type Extracted = {
  page_url: string;
  store_domain: string;
  title?: string;
  brand?: string;
  model?: string;
  price?: { value: number; currency: string };
  rating?: number;
  review_count?: number;
  key_specs?: Record<string, string>;
  visible_reviews?: string[];
  shipping_returns?: string;
};

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
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
};

export type ChatResponse = {
  message: ChatMessage;
};

export type ExtractRequest = { type: "EXTRACT_REQUEST" };

export type AnalyzeResultMsg = {
  type: "ANALYZE_RESULT";
  tabId: number;
  result: AnalyzeResult;
};

export type ChatResponseMsg = {
  type: "CHAT_RESPONSE";
  tabId: number;
  message: ChatMessage;
};

export type StatusMsg = {
  type: "STATUS";
  tabId: number;
  message: string;
};

export type ErrorMsg = {
  type: "ERROR";
  tabId: number;
  message: string;
};
