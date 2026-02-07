declare const chrome: any;

import type { Extracted, ExtractRequest } from "../shared/types";

const textFromSelectors = (selectors: string[]): string | undefined => {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    const text = el?.textContent?.trim();
    if (text) return text;
  }
  return undefined;
};

const metaContent = (names: string[]): string | undefined => {
  for (const name of names) {
    const el = document.querySelector(
      `meta[name="${name}"], meta[property="${name}"]`,
    );
    const content = el?.getAttribute("content")?.trim();
    if (content) return content;
  }
  return undefined;
};

const parseNumber = (value?: string): number | undefined => {
  if (!value) return undefined;
  const normalized = value.replace(/[^0-9.]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const extractSpecs = (): Record<string, string> | undefined => {
  const specs: Record<string, string> = {};

  document.querySelectorAll("table").forEach((table) => {
    table.querySelectorAll("tr").forEach((row) => {
      const key = row.querySelector("th")?.textContent?.trim();
      const value = row.querySelector("td")?.textContent?.trim();
      if (key && value) specs[key] = value;
    });
  });

  document.querySelectorAll("dl").forEach((dl) => {
    const terms = Array.from(dl.querySelectorAll("dt"));
    terms.forEach((term) => {
      const key = term.textContent?.trim();
      const value = term.nextElementSibling?.textContent?.trim();
      if (key && value) specs[key] = value;
    });
  });

  return Object.keys(specs).length > 0 ? specs : undefined;
};

const extractVisibleReviews = (): string[] | undefined => {
  const selectors = [
    "[itemprop=review]",
    "[data-hook=review]",
    ".review",
    ".reviews-list .review-item",
  ];

  const reviews: string[] = [];
  document.querySelectorAll(selectors.join(",")).forEach((el) => {
    if (reviews.length >= 5) return;
    const text = el.textContent?.trim();
    if (text && text.length > 20) {
      reviews.push(text.replace(/\s+/g, " "));
    }
  });

  return reviews.length > 0 ? reviews : undefined;
};

const extract = (): Extracted => {
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
    "USD";

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
    page_url: location.href,
    store_domain: location.host,
    title,
    brand,
    model,
    price:
      priceNumber !== undefined
        ? { value: priceNumber, currency: priceCurrency }
        : undefined,
    rating: parseNumber(ratingValue),
    review_count: parseNumber(reviewCount),
    key_specs: extractSpecs(),
    visible_reviews: extractVisibleReviews(),
  };
};

chrome.runtime.onMessage.addListener(
  (message: ExtractRequest, _sender, sendResponse) => {
    if (message.type === "EXTRACT_REQUEST") {
      sendResponse(extract());
      return true;
    }
    return false;
  },
);
