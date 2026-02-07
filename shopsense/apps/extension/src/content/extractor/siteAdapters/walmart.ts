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

const extractWalmartSpecs = (): Record<string, string> | undefined => {
  const specs: Record<string, string> = {};
  const sections = [
    "[data-testid=specifications-section]",
    "[data-testid=product-specifications]",
    "#product-specifications",
    "#specifications",
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

const extractWalmartShipping = (): string | undefined => {
  const shippingContent = document.querySelector("#fulfillment-Shipping-content");
  if (!shippingContent) return undefined;

  const parts: string[] = [];
  
  // Arrives date
  const arrivesEl = shippingContent.querySelector('[data-seo-id="fulfillment-shipping-intent"]');
  const arrivesText = arrivesEl?.textContent?.trim();
  if (arrivesText) parts.push(arrivesText);

  // Order deadline
  const deadlineEl = arrivesEl?.nextElementSibling;
  const deadlineText = deadlineEl?.textContent?.trim();
  if (deadlineText && deadlineText !== arrivesText) parts.push(deadlineText);

  // Price (Free or cost)
  const priceEl = shippingContent.querySelector(".f7.b.green, .f7.b");
  const priceText = priceEl?.textContent?.trim();
  if (priceText) parts.push(priceText);

  return parts.length > 0 ? parts.join(" - ") : undefined;
};

const extractWalmartReviews = (): string[] | undefined => {
  const reviews: string[] = [];
  const reviewContainers = document.querySelectorAll('[data-testid="enhanced-review-content"]');
  
  reviewContainers.forEach((container) => {
    if (reviews.length >= 5) return;
    
    const titleEl = container.querySelector('h3');
    const title = titleEl?.textContent?.trim() || '';
    
    const bodyEl = container.querySelector('p[tabindex="-1"]');
    const body = bodyEl?.textContent?.trim() || '';
    
    if (body && body.length > 20) {
      const reviewText = title ? `${title}. ${body}` : body;
      reviews.push(reviewText.replace(/\s+/g, " "));
    }
  });
  
  return reviews.length > 0 ? reviews : undefined;
};

export const extractWalmart = (): Partial<Extracted> => {
  const title = textFromSelectors([
    "[data-testid=product-title]",
    "h1",
    "[itemprop=name]",
  ]);

  const brand = textFromSelectors([
    "[data-testid=brand-name]",
    "[itemprop=brand]",
    "a[data-testid=brand-name]",
    "[data-automation-id=brand-name]",
  ]);

  const priceText =
    textFromSelectors([
      "[data-testid=price-wrap] [itemprop=price]",
      "[data-testid=price-wrap]",
      "[data-testid=price]",
      "[itemprop=price]",
      "[data-automation-id=product-price]",
    ]) ?? metaContent(["product:price:amount", "price", "og:price:amount"]);
  const priceNumber = parseNumber(priceText);
  const priceCurrency =
    metaContent(["product:price:currency", "price:currency"]) ||
    inferCurrency(priceText, "USD");

  // Extract rating from reviews-and-ratings section
  const reviewsSection = document.querySelector('[data-testid="reviews-and-ratings"]');
  let ratingText: string | undefined;
  let reviewCount: string | undefined;
  
  if (reviewsSection) {
    // Try to get rating from span.w_iUH7 (e.g., "4.8 stars out of 4846 reviews")
    const ratingSpan = reviewsSection.querySelector('span.w_iUH7');
    if (ratingSpan) {
      const fullText = ratingSpan.textContent?.trim() || '';
      // Extract "4.8" from "4.8 stars out of 4846 reviews"
      const ratingMatch = fullText.match(/(\d+\.?\d*)\s*stars?/i);
      if (ratingMatch) {
        ratingText = ratingMatch[1];
      }
      // Extract review count from same text
      const countMatch = fullText.match(/(\d+(?:,\d+)?)\s*reviews?/i);
      if (countMatch) {
        reviewCount = countMatch[1];
      }
    }
    
    // Fallback: try span.f7 with "(4.8)" format
    if (!ratingText) {
      const ratingParenthesis = reviewsSection.querySelector('span.f7');
      const parenText = ratingParenthesis?.textContent?.trim() || '';
      const parenMatch = parenText.match(/\((\d+\.?\d*)\)/);
      if (parenMatch) {
        ratingText = parenMatch[1];
      }
    }
    
    // Fallback: try itemprop="ratingCount" for review count
    if (!reviewCount) {
      const countEl = reviewsSection.querySelector('[itemprop="ratingCount"]');
      const countText = countEl?.textContent?.trim() || '';
      const countMatch = countText.match(/(\d+(?:,\d+)?)/);
      if (countMatch) {
        reviewCount = countMatch[1];
      }
    }
  }
  
  // Fallback to generic selectors
  if (!ratingText) {
    ratingText = textFromSelectors([
      "[data-testid=reviews-rating]",
      "[itemprop=ratingValue]",
      ".stars-container",
    ]);
  }
  
  if (!reviewCount) {
    reviewCount = textFromSelectors([
      "[data-testid=reviews-header]",
      "[data-testid=reviews-count]",
      "[itemprop=reviewCount]",
      ".stars-reviews-count",
    ]);
  }

  const keySpecs = extractWalmartSpecs();
  const model = keySpecs?.["Model"] || keySpecs?.["Model Number"];

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
    visible_reviews: extractWalmartReviews() || extractVisibleReviews([
      "[data-testid=review-card]",
      "[data-testid=review-text]",
      "[data-testid=review-body]",
      ".review-text",
      ".prod-ProductReview",
      ".review-body",
      "[data-automation-id=review-text]",
      "section[data-testid=reviews-section] [data-testid=review-card]",
    ]),
    shipping_returns: extractWalmartShipping(),
  };
};
