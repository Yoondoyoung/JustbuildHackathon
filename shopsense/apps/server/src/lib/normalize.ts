import type { NormalizedProduct } from "../types/normalized";

/** Extension/content script에서 오는 추출 데이터와 호환되는 형태 */
export type ExtractedLike = {
  page_url: string;
  store_domain?: string;
  title?: string;
  brand?: string;
  model?: string;
  price?: { value: number; currency: string };
  rating?: number;
  review_count?: number;
  key_specs?: Record<string, string>;
  visible_reviews?: string[];
};

export function toNormalized(extracted: ExtractedLike): NormalizedProduct {
  return {
    page_url: extracted.page_url,
    store_domain: extracted.store_domain,
    title: extracted.title,
    brand: extracted.brand,
    model: extracted.model,
    price: extracted.price,
    rating: extracted.rating,
    review_count: extracted.review_count,
    key_specs: extracted.key_specs,
    visible_reviews: extracted.visible_reviews,
  };
}
