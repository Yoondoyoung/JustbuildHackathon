import { buildProductDetailParams, serpSearch } from '../connectors/serpapi.client';
import type { ProductDetailResponse, ReviewItem } from '../schemas/search.schemas';
import { env } from '../config/env';
import { summarizeReviews, generateReviews } from './review-summary';

function parsePrice(value: unknown): { amount: number; currency: string } | undefined {
  if (value == null) return undefined;
  if (typeof value === 'number' && !Number.isNaN(value)) return { amount: value, currency: 'USD' };
  const s = String(value).trim();
  if (!s) return undefined;
  const match = s.replace(/,/g, '').match(/(?:(\$|USD|US\s*\$)\s*)?([\d.]+)/i);
  if (!match) return undefined;
  const amount = parseFloat(match[2]);
  if (Number.isNaN(amount)) return undefined;
  return { amount, currency: 'USD' };
}

function num(val: unknown): number | undefined {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val === 'string') {
    const n = parseFloat(val.replace(/,/g, ''));
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

function str(val: unknown): string {
  if (val == null) return '';
  return String(val).trim();
}

/** Extract review list from SerpAPI product response. Tries common keys. */
function extractReviews(data: Record<string, unknown>): ReviewItem[] {
  // SerpAPI Amazon: reviews_information.authors_reviews[] with title, text, rating, date, author
  const reviewsInfo = data.reviews_information as Record<string, unknown> | undefined;
  if (reviewsInfo && typeof reviewsInfo === 'object') {
    const authorsReviews = reviewsInfo.authors_reviews;
    if (Array.isArray(authorsReviews)) {
      const out = mapReviewsArray(authorsReviews);
      if (out.length) return out;
    }
  }
  // Some APIs nest reviews under an object (e.g. { reviews: { reviews: [...] } })
  const nested = data.reviews as Record<string, unknown> | undefined;
  if (nested && typeof nested === 'object' && Array.isArray(nested.reviews)) {
    const arr = nested.reviews as unknown[];
    const out = mapReviewsArray(arr);
    if (out.length) return out;
  }
  const possibleKeys = [
    'reviews',
    'top_reviews',
    'customer_reviews',
    'review_results',
  ];
  for (const key of possibleKeys) {
    const arr = data[key];
    if (!Array.isArray(arr)) continue;
    const out = mapReviewsArray(arr);
    if (out.length) return out;
  }
  return [];
}

function mapReviewsArray(arr: unknown[]): ReviewItem[] {
  const out: ReviewItem[] = [];
  for (const x of arr) {
    if (!x || typeof x !== 'object') continue;
    const o = x as Record<string, unknown>;
    // SerpAPI authors_reviews uses "text" for body
    const body = str(o.body ?? o.text ?? o.snippet ?? o.content ?? o.review);
    if (!body) continue;
    out.push({
      title: str(o.title).trim() || undefined,
      body,
      rating: num(o.rating ?? o.stars),
      date: str(o.date ?? o.published_date).trim() || undefined,
      author: str(o.author ?? o.author_name ?? o.name ?? o.username).trim() || undefined,
    });
  }
  return out;
}

/** Fetch Amazon product detail + reviews by ASIN. */
export async function fetchProductDetail(
  source: 'amazon' | 'google' | 'walmart',
  sourceId: string,
  requestId: string
): Promise<ProductDetailResponse> {
  const start = Date.now();

  if (source !== 'amazon') {
    return {
      source,
      sourceId,
      reviews: [],
      meta: { requestId, latencyMs: Date.now() - start },
    };
  }

  if (env.MOCK_MODE) {
    const mockReviews = [
      { body: 'Great product, would buy again.', rating: 5, author: 'Mock User' },
      { body: 'Good value for money.', rating: 4 },
    ];
    const mockSummary = await summarizeReviews(mockReviews.map((r) => r.body));
    return {
      source: 'amazon',
      sourceId,
      title: `Mock Product ${sourceId}`,
      description: 'Mock description for testing.',
      rating: 4.5,
      reviewCount: 100,
      reviews: mockReviews,
      reviewsSummary: mockSummary,
      meta: { requestId, latencyMs: Date.now() - start },
    };
  }

  const params = buildProductDetailParams(sourceId);
  const data = await serpSearch<Record<string, unknown>>('amazon', params);

  const productResults = data.product_results as Record<string, unknown> | undefined;
  let reviews = extractReviews(data);
  if (reviews.length === 0 && productResults) reviews = extractReviews(productResults);
  let top5Reviews = reviews.slice(0, 5);

  // SerpAPI에서 리뷰가 없으면 상품 정보로 AI 리뷰 5개 생성
  const pr = productResults ?? {};
  if (top5Reviews.length === 0 && pr && env.OPENAI_API_KEY && str(pr.title)) {
    const generated = await generateReviews({
      title: str(pr.title),
      description: str(pr.description),
      rating: num(pr.rating),
      reviewCount: num(pr.reviews),
    });
    top5Reviews = generated.slice(0, 5);
  }
  const reviewsSummary = await summarizeReviews(top5Reviews.map((r) => r.body));
  const title = str(pr.title);
  const description = str(pr.description);
  const price = parsePrice(pr.price ?? pr.extracted_price);
  const listPrice = parsePrice(pr.list_price ?? pr.old_price ?? pr.extracted_old_price);
  const rating = num(pr.rating);
  const reviewCount = num(pr.reviews);
  const meta = data.search_metadata as Record<string, unknown> | undefined;
  const metaUrl = meta && typeof meta.amazon_product_url === 'string' ? String(meta.amazon_product_url).trim() : '';
  const prLink = str(pr.link ?? pr.link_clean);
  const link =
    metaUrl ||
    (prLink.includes('amazon') && prLink.includes('/dp/') ? prLink : '') ||
    (sourceId ? `https://www.amazon.com/dp/${sourceId}` : '');
  const thumbnail = str(pr.thumbnail);
  const thumbnails = pr.thumbnails as string[] | undefined;
  const imageUrl = thumbnail || (Array.isArray(thumbnails) && thumbnails[0]) || undefined;

  let specifications: Record<string, string> | undefined;
  const specs = pr.item_specifications ?? pr.specs;
  if (specs && typeof specs === 'object' && !Array.isArray(specs)) {
    specifications = {};
    for (const [k, v] of Object.entries(specs)) {
      if (v != null && typeof v === 'string') specifications[k] = v.trim();
    }
    if (Object.keys(specifications).length === 0) specifications = undefined;
  }

  let aboutItem: string[] | undefined;
  const about = pr.about_item;
  if (Array.isArray(about)) {
    aboutItem = about.map((x) => (typeof x === 'string' ? x : String(x)).trim()).filter(Boolean);
    if (aboutItem.length === 0) aboutItem = undefined;
  }

  const latencyMs = Date.now() - start;

  return {
    source: 'amazon',
    sourceId,
    title: title || undefined,
    description: description || undefined,
    price,
    listPrice,
    rating,
    reviewCount,
    url: link || undefined,
    imageUrl: imageUrl || undefined,
    specifications,
    aboutItem,
    reviews: top5Reviews,
    reviewsSummary,
    meta: { requestId, latencyMs },
  };
}
