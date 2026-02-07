export type SearchRequest = {
  query: string;
  locale?: string;
  maxResultsPerSource?: number;
  priceMin?: number;
  priceMax?: number;
  condition?: "new" | "used" | "refurb";
  sort?: SortMode;
};

export type Price = {
  amount: number;
  currency: string;
};

export type Shipping = {
  cost?: number;
  etaDays?: number;
  primeLike?: boolean;
};

export type ProductItem = {
  source: "amazon" | "google" | "walmart";
  sourceId?: string;
  title: string;
  brand?: string;
  model?: string;
  price?: Price;
  listPrice?: Price;
  rating?: number;
  reviewCount?: number;
  reviewSnippets?: string[];
  description?: string;
  specifications?: Record<string, string>;
  availability?: "in_stock" | "out_of_stock" | "unknown";
  shipping?: Shipping;
  deliveryText?: string[];
  offers?: string[];
  boughtLastMonth?: string;
  stock?: string;
  badges?: string[];
  sellerName?: string;
  url: string;
  imageUrl?: string;
  features: string[];
  fingerprint: string;
  raw?: Record<string, unknown>;
};

export type SourceError = {
  source: "amazon" | "google" | "walmart";
  code: string;
  message: string;
  retryable: boolean;
};

export type SearchResponse = {
  query: string;
  timestamp: string;
  results: ProductItem[];
  meta: {
    requestId: string;
    latencyMs: number;
    perSourceCounts: Record<"amazon" | "google" | "walmart", number>;
    errors: SourceError[];
    warnings: string[];
  };
};

export type ReviewItem = {
  title?: string;
  body: string;
  rating?: number;
  date?: string;
  author?: string;
};

export type ProductDetailResponse = {
  source: "amazon" | "google" | "walmart";
  sourceId: string;
  title?: string;
  description?: string;
  price?: Price;
  listPrice?: Price;
  rating?: number;
  reviewCount?: number;
  url?: string;
  imageUrl?: string;
  specifications?: Record<string, string>;
  aboutItem?: string[];
  reviews: ReviewItem[];
  reviewsSummary?: string;
  meta: {
    requestId: string;
    latencyMs: number;
  };
};

export type BraveWebResult = {
  title: string;
  url: string;
  description: string;
  content: string;
};

export type SortMode = "relevance" | "price_asc" | "price_desc" | "rating_desc";
