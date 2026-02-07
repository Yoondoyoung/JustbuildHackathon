import { tokenize } from "../utils/text";
import type { ProductItem } from "../types/search";

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const setB = new Set(b);
  let intersection = 0;
  for (const x of a) {
    if (setB.has(x)) intersection++;
  }
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

export function relevanceScore(query: string, item: ProductItem): number {
  const queryTokens = tokenize(query);
  const titleTokens = tokenize(item.title);
  const similarity = jaccard(queryTokens, titleTokens);
  const rating = item.rating ?? 0;
  const reviewCount = item.reviewCount ?? 0;
  const priceAmount = item.price?.amount ?? 0;
  const score =
    similarity +
    0.2 * rating +
    0.1 * Math.log(reviewCount + 1) -
    0.05 * (priceAmount / 100);
  return score;
}

export type SortMode = "relevance" | "price_asc" | "price_desc" | "rating_desc";

export function sortProducts(
  items: ProductItem[],
  query: string,
  sort: SortMode
): ProductItem[] {
  const withRelevance = items.map((item) => ({
    item,
    score: relevanceScore(query, item),
  }));

  const sorted = [...withRelevance].sort((a, b) => {
    if (sort === "relevance") {
      if (b.score !== a.score) return b.score - a.score;
    } else if (sort === "price_asc") {
      const pa = a.item.price?.amount ?? Infinity;
      const pb = b.item.price?.amount ?? Infinity;
      if (pa !== pb) return pa - pb;
    } else if (sort === "price_desc") {
      const pa = a.item.price?.amount ?? -Infinity;
      const pb = b.item.price?.amount ?? -Infinity;
      if (pa !== pb) return pb - pa;
    } else if (sort === "rating_desc") {
      const ra = a.item.rating ?? -Infinity;
      const rb = b.item.rating ?? -Infinity;
      if (rb !== ra) return rb - ra;
    }
    const revA = a.item.reviewCount ?? 0;
    const revB = b.item.reviewCount ?? 0;
    if (revB !== revA) return revB - revA;
    return (a.item.title ?? "").localeCompare(b.item.title ?? "");
  });

  return sorted.map((x) => x.item);
}
