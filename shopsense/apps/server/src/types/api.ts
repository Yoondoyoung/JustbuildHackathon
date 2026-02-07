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
