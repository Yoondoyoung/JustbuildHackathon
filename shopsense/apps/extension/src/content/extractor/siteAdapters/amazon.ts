import type { Extracted } from "../../../shared/types";
import {
  collectSpecs,
  extractSpecs,
  extractVisibleReviews,
  inferCurrency,
  metaContent,
  parseNumber,
  parseRating,
  textFromSelectors,
} from "./generic";

const cleanBrand = (value?: string): string | undefined => {
  if (!value) return undefined;
  const cleaned = value
    .replace(/^Brand:\s*/i, "")
    .replace(/^Visit the\s*/i, "")
    .replace(/\s*Store$/i, "")
    .trim();
  return cleaned || undefined;
};

const extractAmazonSpecs = (): Record<string, string> | undefined => {
  const specs: Record<string, string> = {};
  const sections = [
    "#productDetails_techSpec_section_1",
    "#productDetails_detailBullets_sections1",
    "#technicalSpecifications_feature_div",
    "#detailBullets_feature_div",
    "#detailBulletsWrapper_feature_div",
    "#prodDetails",
  ];
  sections.forEach((selector) => {
    const section = document.querySelector(selector);
    if (section) collectSpecs(section, specs);
  });
  const fallback = extractSpecs();
  if (fallback) {
    Object.entries(fallback).forEach(([key, value]) => {
      if (!specs[key]) specs[key] = value;
    });
  }
  return Object.keys(specs).length > 0 ? specs : undefined;
};

const extractAmazonShipping = (): string | undefined =>
  textFromSelectors([
    "#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE",
    "#mir-layout-DELIVERY_BLOCK-slot-DELIVERY_MESSAGE",
    "#deliveryMessageMirId",
    "#deliveryMessage",
    "#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_SMALL",
  ]);

export const extractAmazon = (): Partial<Extracted> => {
  const title = textFromSelectors(["#productTitle", "h1#title"]);

  const bylineEl = document.querySelector("#bylineInfo");
  const brand = cleanBrand(bylineEl?.getAttribute("aria-label") ?? bylineEl?.textContent ?? "");

  const priceText =
    textFromSelectors([
      "#corePrice_feature_div .a-offscreen",
      "#apex_desktop .a-price .a-offscreen",
      "#priceblock_ourprice",
      "#priceblock_dealprice",
      "#priceblock_saleprice",
    ]) ?? metaContent(["product:price:amount", "price", "og:price:amount"]);
  const priceNumber = parseNumber(priceText);
  const priceCurrency =
    metaContent(["product:price:currency", "price:currency"]) ||
    inferCurrency(priceText, "USD");

  const ratingEl = document.querySelector("#acrPopover");
  const ratingText =
    ratingEl?.getAttribute("title") ||
    ratingEl?.textContent ||
    textFromSelectors([
      "#averageCustomerReviews .a-icon-alt",
      "span[data-hook=rating-out-of-text]",
    ]);

  const reviewCount = textFromSelectors([
    "#acrCustomerReviewText",
    "span[data-hook=total-review-count]",
  ]);

  const keySpecs = extractAmazonSpecs();
  const model =
    keySpecs?.["Item model number"] ||
    keySpecs?.["Model"] ||
    textFromSelectors(["[itemprop=mpn]"]);

  return {
    title,
    brand,
    model,
    price:
      priceNumber !== undefined
        ? { value: priceNumber, currency: priceCurrency }
        : undefined,
    rating: parseRating(ratingText),
    review_count: parseNumber(reviewCount),
    key_specs: keySpecs,
    visible_reviews: extractVisibleReviews([
      "[data-hook=review-body]",
      ".review-text",
      "[data-hook=review]",
    ]),
    shipping_returns: extractAmazonShipping(),
  };
};
