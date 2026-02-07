import type { ProductItem, Price, Shipping } from '../schemas/search.schemas';
import { env } from '../config/env';

export type ProductSource = 'amazon' | 'google' | 'walmart';

function parsePrice(value: unknown): { amount: number; currency: string } | undefined {
  if (value == null) return undefined;
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return { amount: value, currency: 'USD' };
  }
  const s = String(value).trim();
  if (!s) return undefined;
  const match = s.replace(/,/g, '').match(/(?:(\$|USD|US\s*\$)\s*)?([\d.]+)/i);
  if (!match) return undefined;
  const amount = parseFloat(match[2]);
  if (Number.isNaN(amount)) return undefined;
  const currency = /^\$|USD|US\s*\$/i.test(s) ? 'USD' : 'USD';
  return { amount, currency };
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

function availability(raw: Record<string, unknown>): 'in_stock' | 'out_of_stock' | 'unknown' {
  const inStock = raw.in_stock ?? raw.availability;
  if (typeof inStock === 'boolean') return inStock ? 'in_stock' : 'out_of_stock';
  if (typeof inStock === 'string') {
    const lower = inStock.toLowerCase();
    if (lower.includes('in stock') || lower.includes('available')) return 'in_stock';
    if (lower.includes('out of stock') || lower.includes('unavailable')) return 'out_of_stock';
  }
  return 'unknown';
}

function features(raw: Record<string, unknown>): string[] {
  const ex = raw.extensions ?? raw.highlights ?? raw.features;
  if (Array.isArray(ex)) {
    return ex.map((x) => (typeof x === 'string' ? x : String(x))).filter(Boolean);
  }
  return [];
}

function description(raw: Record<string, unknown>): string | undefined {
  const d = raw.description ?? raw.snippet ?? raw.product_description ?? raw.desc;
  const s = str(d);
  return s || undefined;
}

function reviewSnippets(raw: Record<string, unknown>): string[] | undefined {
  const arr = raw.sustainability_features ?? raw.review_snippets;
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  const out: string[] = [];
  for (const x of arr) {
    if (x && typeof x === 'object' && 'snippet' in x && typeof (x as { snippet: unknown }).snippet === 'string') {
      out.push((x as { snippet: string }).snippet.trim());
    }
  }
  return out.length ? out : undefined;
}

function specifications(raw: Record<string, unknown>): Record<string, string> | undefined {
  const specs = raw.specs ?? raw.specifications;
  if (!specs || typeof specs !== 'object' || Array.isArray(specs)) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(specs)) {
    if (v != null && typeof v === 'string') out[k] = v.trim();
  }
  return Object.keys(out).length ? out : undefined;
}

function deliveryText(raw: Record<string, unknown>): string[] | undefined {
  const d = raw.delivery;
  if (Array.isArray(d)) {
    const lines = d.map((x) => (typeof x === 'string' ? x : String(x)).trim()).filter(Boolean);
    return lines.length ? lines : undefined;
  }
  return undefined;
}

function offers(raw: Record<string, unknown>): string[] | undefined {
  const list: string[] = [];
  const coupon = raw.save_with_coupon ?? raw.coupon;
  if (typeof coupon === 'string' && coupon.trim()) list.push(coupon.trim());
  const off = raw.offers;
  if (Array.isArray(off)) {
    for (const x of off) if (typeof x === 'string' && x.trim()) list.push(x.trim());
  }
  return list.length ? list : undefined;
}

function badgesList(raw: Record<string, unknown>): string[] | undefined {
  const b = raw.badges ?? raw.tags;
  if (Array.isArray(b)) {
    const arr = b.map((x) => (typeof x === 'string' ? x : String(x)).trim()).filter(Boolean);
    return arr.length ? arr : undefined;
  }
  const special = raw.special_offer_text ?? raw.badge;
  if (typeof special === 'string' && special.trim()) return [special.trim()];
  return undefined;
}

export function normalize(source: ProductSource, rawItem: Record<string, unknown>): ProductItem {
  const title = str(rawItem.title ?? rawItem.name ?? '');
  // Walmart uses product_page_url; others use link/product_link
  const url = str(
    rawItem.product_page_url ?? rawItem.link ?? rawItem.product_link ?? rawItem.url ?? '#'
  );
  const imageUrl = str(rawItem.thumbnail ?? rawItem.image ?? rawItem.thumbnail_image ?? '') || undefined;
  // Walmart: price in primary_offer.offer_price; others use price/extracted_price
  const primaryOffer = rawItem.primary_offer as { offer_price?: number; currency?: string } | undefined;
  const price = parsePrice(
    primaryOffer?.offer_price ?? rawItem.price ?? rawItem.extracted_price ?? rawItem.current_price
  );
  const listPrice = parsePrice(
    rawItem.list_price ?? rawItem.original_price ?? rawItem.old_price ?? rawItem.extracted_old_price
  );
  const rating = num(rawItem.rating ?? rawItem.stars);
  const reviewCount = num(rawItem.reviews ?? rawItem.review_count ?? rawItem.reviewCount);
  const avail = availability(rawItem);
  const feats = features(rawItem);
  const brand = str(rawItem.brand ?? rawItem.source ?? rawItem.manufacturer ?? '').trim() || undefined;
  const model = str(rawItem.model ?? rawItem.product_id ?? rawItem.asin ?? '').trim() || undefined;

  let shipping: Shipping | undefined;
  const shipCost = num(rawItem.shipping ?? rawItem.delivery_cost);
  const eta = num(rawItem.delivery_days ?? rawItem.eta_days);
  const primeLike = rawItem.prime === true || rawItem.prime_eligible === true;
  if (shipCost != null || eta != null || primeLike) {
    shipping = {};
    if (shipCost != null) shipping.cost = shipCost;
    if (eta != null) shipping.etaDays = eta;
    if (primeLike) shipping.primeLike = true;
  }

  const desc = description(rawItem);
  const reviewSnips = reviewSnippets(rawItem);
  const specs = specifications(rawItem);
  const delivery = deliveryText(rawItem);
  const offerLines = offers(rawItem);
  const boughtLastMonth = typeof rawItem.bought_last_month === 'string' ? rawItem.bought_last_month.trim() || undefined : undefined;
  const stock = typeof rawItem.stock === 'string' ? rawItem.stock.trim() || undefined : undefined;
  const badges = badgesList(rawItem);
  const sellerName = str(rawItem.seller_name ?? rawItem.seller ?? '').trim() || undefined;

  let sourceId = str(
    rawItem.product_id ?? rawItem.us_item_id ?? rawItem.asin ?? rawItem.id ?? ''
  ).trim() || undefined;
  if (!sourceId && source === 'amazon' && url) {
    const asinMatch = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
    if (asinMatch) sourceId = asinMatch[1];
  }

  const item: ProductItem = {
    source,
    sourceId,
    title: title || 'Untitled',
    brand,
    model,
    price,
    listPrice,
    rating,
    reviewCount,
    reviewSnippets: reviewSnips,
    description: desc,
    specifications: specs,
    availability: avail,
    shipping,
    deliveryText: delivery,
    offers: offerLines,
    boughtLastMonth,
    stock,
    badges,
    sellerName,
    url: url || '#',
    imageUrl,
    features: feats,
    fingerprint: '', // set by dedup
  };

  if (env.DEBUG_RAW) {
    item.raw = rawItem as Record<string, unknown>;
  }

  return item;
}
