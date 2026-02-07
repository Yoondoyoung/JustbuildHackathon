import type { Extracted } from "../../../shared/types";

export const textFromSelectors = (
  selectors: string[],
  root: ParentNode = document,
): string | undefined => {
  for (const selector of selectors) {
    const el = root.querySelector(selector);
    const text = el?.textContent?.trim();
    if (text) return text;
  }
  return undefined;
};

export const metaContent = (names: string[]): string | undefined => {
  for (const name of names) {
    const el = document.querySelector(
      `meta[name="${name}"], meta[property="${name}"]`,
    );
    const content = el?.getAttribute("content")?.trim();
    if (content) return content;
  }
  return undefined;
};

export const parseNumber = (value?: string): number | undefined => {
  if (!value) return undefined;
  const normalized = value.replace(/[^0-9.]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const parseRating = (value?: string): number | undefined => {
  if (!value) return undefined;
  const match = value.replace(/,/g, "").match(/(\d+(\.\d+)?)/);
  return match ? parseNumber(match[1]) : undefined;
};

export const inferCurrency = (value?: string, fallback = "USD"): string => {
  if (!value) return fallback;
  if (value.includes("£")) return "GBP";
  if (value.includes("€")) return "EUR";
  if (value.includes("¥")) return "JPY";
  if (value.includes("₩")) return "KRW";
  if (value.includes("$")) return "USD";
  return fallback;
};

const normalizeKey = (key: string) => key.replace(/[:：]\s*$/, "").trim();

const addSpec = (specs: Record<string, string>, key?: string, value?: string) => {
  const normalizedKey = key ? normalizeKey(key) : "";
  const normalizedValue = value?.trim() ?? "";
  if (!normalizedKey || !normalizedValue) return;
  if (!specs[normalizedKey]) {
    specs[normalizedKey] = normalizedValue;
  }
};

export const collectSpecs = (root: ParentNode, specs: Record<string, string>) => {
  root.querySelectorAll("table").forEach((table) => {
    table.querySelectorAll("tr").forEach((row) => {
      addSpec(
        specs,
        row.querySelector("th")?.textContent,
        row.querySelector("td")?.textContent,
      );
    });
  });

  root.querySelectorAll("dl").forEach((dl) => {
    const terms = Array.from(dl.querySelectorAll("dt"));
    terms.forEach((term) => {
      addSpec(specs, term.textContent, term.nextElementSibling?.textContent);
    });
  });

  root.querySelectorAll("li").forEach((li) => {
    const keyEl = li.querySelector("span.a-text-bold, strong, b");
    if (!keyEl) return;
    const rawKey = keyEl.textContent ?? "";
    const normalized = normalizeKey(rawKey);
    if (!normalized) return;
    const fullText = li.textContent ?? "";
    const value = fullText.replace(rawKey, "").replace(/^[\s:-]+/, "").trim();
    addSpec(specs, normalized, value);
  });
};

export const extractSpecs = (root: ParentNode = document): Record<string, string> | undefined => {
  const specs: Record<string, string> = {};
  collectSpecs(root, specs);
  return Object.keys(specs).length > 0 ? specs : undefined;
};

const defaultReviewSelectors = [
  "[itemprop=review]",
  "[data-hook=review]",
  ".review",
  ".reviews-list .review-item",
  "[data-testid=review-card]",
  ".ugc-review-body",
];

export const extractVisibleReviews = (
  selectors: string[] = defaultReviewSelectors,
  root: ParentNode = document,
): string[] | undefined => {
  const reviews: string[] = [];
  root.querySelectorAll(selectors.join(",")).forEach((el) => {
    if (reviews.length >= 5) return;
    const text = el.textContent?.trim();
    if (text && text.length > 20) {
      reviews.push(text.replace(/\s+/g, " "));
    }
  });
  return reviews.length > 0 ? reviews : undefined;
};

export const extractGeneric = (): Partial<Extracted> => {
  const title =
    metaContent(["og:title", "twitter:title"]) ||
    textFromSelectors(["h1", "[itemprop=name]", "[data-test=product-title]"]) ||
    document.title;

  const brand =
    metaContent(["product:brand", "og:brand"]) ||
    textFromSelectors([
      "[itemprop=brand]",
      "[data-brand]",
      ".brand",
      ".product-brand",
    ]);

  const model =
    metaContent(["product:mpn", "product:model"]) ||
    textFromSelectors(["[itemprop=mpn]", "[data-model]"]);

  const priceValue =
    metaContent(["product:price:amount", "price", "og:price:amount"]) ||
    textFromSelectors([
      "[itemprop=price]",
      "[data-test=product-price]",
      ".price",
    ]);

  const priceCurrency =
    metaContent(["product:price:currency", "price:currency"]) ||
    document.querySelector("[itemprop=priceCurrency]")?.getAttribute("content") ||
    inferCurrency(priceValue, "USD");

  const ratingValue =
    metaContent(["rating", "ratingValue"]) ||
    textFromSelectors([
      "[itemprop=ratingValue]",
      "[data-test=rating]",
      ".rating",
    ]);

  const reviewCount =
    metaContent(["reviewCount"]) ||
    textFromSelectors([
      "[itemprop=reviewCount]",
      "[data-hook=total-review-count]",
      ".review-count",
    ]);

  const priceNumber = parseNumber(priceValue);

  return {
    title,
    brand,
    model,
    price:
      priceNumber !== undefined
        ? { value: priceNumber, currency: priceCurrency }
        : undefined,
    rating: parseRating(ratingValue),
    review_count: parseNumber(reviewCount),
    key_specs: extractSpecs(),
    visible_reviews: extractVisibleReviews(),
  };
};
