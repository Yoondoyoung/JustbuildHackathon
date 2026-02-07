import { z } from 'zod';

export const searchRequestSchema = z.object({
  query: z.string().min(1, 'query is required and must be non-empty'),
  locale: z.string().default('US'),
  maxResultsPerSource: z.number().int().min(1).max(100).default(20),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  condition: z.enum(['new', 'used', 'refurb']).optional(),
  sort: z.enum(['relevance', 'price_asc', 'price_desc', 'rating_desc']).default('relevance'),
});

export type SearchRequest = z.infer<typeof searchRequestSchema>;

export const priceSchema = z.object({
  amount: z.number(),
  currency: z.string(),
});

export const shippingSchema = z.object({
  cost: z.number().optional(),
  etaDays: z.number().optional(),
  primeLike: z.boolean().optional(),
});

export const productItemSchema = z.object({
  source: z.enum(['amazon', 'google', 'walmart']),
  sourceId: z.string().optional(),
  title: z.string(),
  brand: z.string().optional(),
  model: z.string().optional(),
  /** Current selling price */
  price: priceSchema.optional(),
  /** Original/list price before discount */
  listPrice: priceSchema.optional(),
  /** Star rating (e.g. 4.5) when available */
  rating: z.number().optional(),
  /** Number of reviews */
  reviewCount: z.number().optional(),
  /** Short review or product snippets for AI context (when API provides) */
  reviewSnippets: z.array(z.string()).optional(),
  /** Product description or long snippet */
  description: z.string().optional(),
  /** Key-value specs (e.g. display_size, connectivity) for AI analysis */
  specifications: z.record(z.string()).optional(),
  availability: z.enum(['in_stock', 'out_of_stock', 'unknown']).optional(),
  shipping: shippingSchema.optional(),
  /** Delivery lines (e.g. "FREE delivery Tue, Apr 29") */
  deliveryText: z.array(z.string()).optional(),
  /** Coupon/offer lines (e.g. "Save 8% with coupon") */
  offers: z.array(z.string()).optional(),
  /** Popularity hint (e.g. "200+ bought in past month") */
  boughtLastMonth: z.string().optional(),
  /** Stock message (e.g. "Only 10 left in stock") */
  stock: z.string().optional(),
  /** Badges (e.g. "Best Seller", "Amazon's Choice") */
  badges: z.array(z.string()).optional(),
  /** Seller name when available */
  sellerName: z.string().optional(),
  url: z.string(),
  imageUrl: z.string().optional(),
  features: z.array(z.string()).default([]),
  fingerprint: z.string(),
  raw: z.record(z.unknown()).optional(),
});

export type ProductItem = z.infer<typeof productItemSchema>;
export type Price = z.infer<typeof priceSchema>;
export type Shipping = z.infer<typeof shippingSchema>;

export const sourceErrorSchema = z.object({
  source: z.enum(['amazon', 'google', 'walmart']),
  code: z.string(),
  message: z.string(),
  retryable: z.boolean(),
});

export type SourceError = z.infer<typeof sourceErrorSchema>;

export const searchResponseSchema = z.object({
  query: z.string(),
  timestamp: z.string(),
  results: z.array(productItemSchema),
  meta: z.object({
    requestId: z.string(),
    latencyMs: z.number(),
    perSourceCounts: z.record(z.enum(['amazon', 'google', 'walmart']), z.number()),
    errors: z.array(sourceErrorSchema),
    warnings: z.array(z.string()),
  }),
});

export type SearchResponse = z.infer<typeof searchResponseSchema>;

// --- Product detail (for single product + reviews) ---

export const productDetailRequestSchema = z.object({
  source: z.enum(['amazon', 'google', 'walmart']),
  sourceId: z.string().min(1, 'sourceId is required (e.g. ASIN for Amazon)'),
});

export type ProductDetailRequest = z.infer<typeof productDetailRequestSchema>;

export const reviewItemSchema = z.object({
  title: z.string().optional(),
  body: z.string(),
  rating: z.number().optional(),
  date: z.string().optional(),
  author: z.string().optional(),
});

export type ReviewItem = z.infer<typeof reviewItemSchema>;

export const productDetailResponseSchema = z.object({
  source: z.enum(['amazon', 'google', 'walmart']),
  sourceId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  price: priceSchema.optional(),
  listPrice: priceSchema.optional(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  url: z.string().optional(),
  imageUrl: z.string().optional(),
  specifications: z.record(z.string()).optional(),
  aboutItem: z.array(z.string()).optional(),
  /** 상위 리뷰 5개 */
  reviews: z.array(reviewItemSchema),
  /** AI가 리뷰를 요약한 텍스트 (OPENAI_API_KEY 있을 때만) */
  reviewsSummary: z.string().optional(),
  meta: z.object({
    requestId: z.string(),
    latencyMs: z.number(),
  }),
});

export type ProductDetailResponse = z.infer<typeof productDetailResponseSchema>;

/** Brave 웹 검색 결과 1건 (상품 단점 검색용) */
export const braveWebResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  description: z.string(),
  /** 본문 스니펫 (description + extra_snippets 합친 실제 내용) */
  content: z.string(),
});

/** amazon-top-reviews 응답 시 각 상품에 붙는 "단점" 웹 검색 결과 (BRAVE_KEY 있을 때만) */
export const productWithConsSearchSchema = productDetailResponseSchema.extend({
  consSearchResults: z.array(braveWebResultSchema).optional(),
});
