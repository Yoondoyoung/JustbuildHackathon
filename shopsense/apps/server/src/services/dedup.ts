import { normalizeText, tokenize } from "../utils/text";
import { stableHash } from "../utils/ids";
import type { ProductItem } from "../types/search";

const CORE_SPEC_REGEX = /\b(\d+\s*gb|\d+\s*tb|\d+gb|\d+tb|\d+\s*inch|\d+"|\d+\s*oz|\d+oz|\d+gb\s*ram|\d+\s*mp)\b/gi;

export function extractCoreSpecTokens(title: string): string[] {
  const normalized = normalizeText(title);
  const matches = normalized.match(CORE_SPEC_REGEX);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.replace(/\s+/g, "").toLowerCase()))];
}

export function computeFingerprint(item: ProductItem): string {
  const normTitle = normalizeText(item.title);
  const normBrand = (item.brand && normalizeText(item.brand)) || "";
  const normModel = (item.model && normalizeText(item.model)) || "";
  const coreTokens = extractCoreSpecTokens(item.title);
  const coreStr = coreTokens.sort().join(" ");
  const payload = [normTitle, normBrand, normModel, coreStr].join("|");
  return stableHash(payload);
}

function richnessScore(item: ProductItem): number {
  let score = 0;
  if (item.price != null) score += 2;
  if (item.rating != null) score += 2;
  if (item.reviewCount != null && item.reviewCount > 0) score += 1;
  if (item.imageUrl) score += 1;
  if (item.shipping && (item.shipping.cost != null || item.shipping.primeLike)) score += 1;
  return score;
}

function tieBreak(a: ProductItem, b: ProductItem): number {
  const revA = a.reviewCount ?? 0;
  const revB = b.reviewCount ?? 0;
  if (revB !== revA) return revB - revA;
  return (b.title ?? "").localeCompare(a.title ?? "");
}

export function deduplicate(items: ProductItem[]): ProductItem[] {
  const withFp = items.map((item) => ({
    ...item,
    fingerprint: item.fingerprint || computeFingerprint(item),
  }));

  const byFp = new Map<string, ProductItem[]>();
  for (const item of withFp) {
    const fp = item.fingerprint;
    const list = byFp.get(fp) ?? [];
    list.push(item);
    byFp.set(fp, list);
  }

  const result: ProductItem[] = [];
  for (const group of byFp.values()) {
    const sorted = [...group].sort((a, b) => {
      const scoreA = richnessScore(a);
      const scoreB = richnessScore(b);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return tieBreak(a, b);
    });
    result.push(sorted[0]);
  }
  return result;
}
