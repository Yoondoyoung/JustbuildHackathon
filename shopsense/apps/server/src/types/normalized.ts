/**
 * Placeholder for the normalized product schema.
 * Replace this type (or extend it) when the extension's normalize layer is ready.
 * The analyze agent accepts this type; keep the same shape when connecting the real schema.
 */
export type NormalizedProduct = {
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
  [key: string]: unknown;
};
