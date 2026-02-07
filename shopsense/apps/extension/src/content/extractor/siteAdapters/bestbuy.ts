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

const extractBestBuySpecs = (): Record<string, string> | undefined => {
  const specs: Record<string, string> = {};
  
  // Try new brix-sheet format first
  const brixSheet = document.querySelector('[data-testid="brix-sheet"]');
  if (brixSheet) {
    // Find all spec rows - look for divs that contain both key and value
    // Try multiple selectors to catch different class name patterns
    const specRows = brixSheet.querySelectorAll(
      'div.inline-flex.w-full, ' +
      'div[class*="inline-flex"][class*="w-full"], ' +
      'div[class*="dB7j8sHUbncyf79K"]'
    );
    
    specRows.forEach((row) => {
      // Key is in a div with font-weight-medium
      const keyEl = row.querySelector('div.font-weight-medium, div[class*="font-weight-medium"]');
      // Value is in a div with pl-300 class or grow basis-none
      const valueEl = row.querySelector('div[class*="pl-300"], div.grow.basis-none[class*="pl-300"]');
      
      if (keyEl && valueEl) {
        // Clone key element to remove buttons before getting text
        const keyClone = keyEl.cloneNode(true) as HTMLElement;
        const buttons = keyClone.querySelectorAll('button');
        buttons.forEach(btn => btn.remove());
        
        let key = keyClone.textContent?.trim() || '';
        const value = valueEl.textContent?.trim() || '';
        
        // Clean up key - remove extra whitespace and trailing punctuation
        key = key.replace(/\s+/g, ' ').trim();
        
        if (key && value && key.length > 0 && value.length > 0) {
          specs[key] = value;
        }
      }
    });
  }
  
  // Extract from Highlights section
  const allH2s = document.querySelectorAll('h2.h5');
  let highlightsSection: Element | null = null;
  for (const h2 of Array.from(allH2s)) {
    if (h2.textContent?.trim() === 'Highlights') {
      highlightsSection = h2;
      break;
    }
  }
  
  if (highlightsSection) {
    const highlightsContainer = highlightsSection.parentElement;
    if (highlightsContainer) {
      const highlightButtons = highlightsContainer.querySelectorAll('button.c-button-unstyled');
      highlightButtons.forEach((button) => {
        const flexColumn = button.querySelector('div.flex.flex-column');
        if (flexColumn) {
          const keyDiv = flexColumn.querySelector('div:first-child');
          const valueDiv = flexColumn.querySelector('div.font-500, div[class*="font-500"]');
          
          if (keyDiv && valueDiv) {
            // Clone to remove SVG icons
            const keyClone = keyDiv.cloneNode(true) as HTMLElement;
            const svgs = keyClone.querySelectorAll('svg');
            svgs.forEach(svg => svg.remove());
            
            let key = keyClone.textContent?.trim() || '';
            let value = valueDiv.textContent?.trim() || '';
            
            // Remove SVG and caret icons from value
            const valueClone = valueDiv.cloneNode(true) as HTMLElement;
            const icons = valueClone.querySelectorAll('svg');
            icons.forEach(icon => icon.remove());
            value = valueClone.textContent?.trim() || '';
            
            key = key.replace(/\s+/g, ' ').trim();
            value = value.replace(/\s+/g, ' ').trim();
            
            if (key && value && key.length > 0 && value.length > 0) {
              // Only add if not already present (brix-sheet takes precedence)
              if (!specs[key]) {
                specs[key] = value;
              }
            }
          }
        }
      });
    }
  }
  
  // Fallback to old format
  const sections = [
    "#specifications",
    ".specifications",
    ".specification-table",
    ".product-data",
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

const extractBestBuyShipping = (): string | undefined => {
  const fulfillmentSelector = document.querySelector('[data-component-name="FulfillmentSelector"]');
  if (!fulfillmentSelector) {
    // Fallback to old selectors
    return textFromSelectors([
      ".fulfillment-additional-info",
      ".availabilityMessage",
      ".fulfillment-fulfillment-summary",
    ]);
  }

  const parts: string[] = [];
  
  // Extract pickup info
  const pickupButton = fulfillmentSelector.querySelector('button[data-test-id="pickup"]');
  if (pickupButton) {
    const pickupText = pickupButton.getAttribute('aria-label') || '';
    // Extract "Ready on Thu, Feb 12" or similar
    const pickupMatch = pickupText.match(/(?:Ready on|Pickup)\s+([^,]+,\s*[^,]+)/i);
    if (pickupMatch) {
      parts.push(`Pickup: ${pickupMatch[1]}`);
    } else {
      // Try to get from button text
      const pickupDate = pickupButton.querySelector('strong')?.textContent?.trim();
      if (pickupDate) {
        parts.push(`Pickup: ${pickupDate}`);
      }
    }
  }
  
  // Extract shipping info
  const shippingButton = fulfillmentSelector.querySelector('button[data-test-id="shipping"]');
  if (shippingButton) {
    const shippingText = shippingButton.getAttribute('aria-label') || '';
    // Extract "Get it by Wed, Feb 11" or similar
    const shippingMatch = shippingText.match(/(?:Get it by|Shipping)\s+([^,]+,\s*[^,]+)/i);
    if (shippingMatch) {
      parts.push(`Shipping: ${shippingMatch[1]}`);
    } else {
      // Try to get from button text
      const shippingDate = shippingButton.querySelector('strong')?.textContent?.trim();
      if (shippingDate) {
        parts.push(`Shipping: ${shippingDate}`);
      }
    }
  }
  
  // Extract additional pickup location info
  const locationText = fulfillmentSelector.textContent || '';
  const locationMatch = locationText.match(/Order now for pickup on ([^a]+) at\s+([^<]+)/i);
  if (locationMatch) {
    parts.push(`Pickup location: ${locationMatch[2].trim()}`);
  }
  
  return parts.length > 0 ? parts.join(" - ") : undefined;
};

export const extractBestBuy = (): Partial<Extracted> => {
  const title = textFromSelectors([".sku-title h1", "h1.sku-title", "h1"]);

  // Extract brand from ProductHeader
  let brand: string | undefined;
  const productHeader = document.querySelector('[data-component-name="ProductHeader"]');
  if (productHeader) {
    const brandLink = productHeader.querySelector('.description a');
    brand = brandLink?.textContent?.trim();
  }
  
  // Extract model from disclaimer
  let model: string | undefined;
  if (productHeader) {
    const disclaimer = productHeader.querySelector('.disclaimer');
    if (disclaimer) {
      const modelText = disclaimer.textContent || '';
      const modelMatch = modelText.match(/Model:\s*([^\s]+)/i);
      if (modelMatch) {
        model = modelMatch[1];
      }
    }
  }

  // Extract price from new price-block format
  let priceText: string | undefined;
  const priceBlock = document.querySelector('[data-testid="price-block-customer-price"]');
  if (priceBlock) {
    priceText = priceBlock.textContent?.trim();
  }
  
  // Fallback to old selectors
  if (!priceText) {
    priceText =
      textFromSelectors([
        ".priceView-hero-price span",
        ".priceView-customer-price span",
        "[data-testid=customer-price]",
        ".pricing-price__regular-price",
      ]) ?? metaContent(["product:price:amount", "price", "og:price:amount"]);
  }
  const priceNumber = parseNumber(priceText);
  const priceCurrency =
    metaContent(["product:price:currency", "price:currency"]) ||
    inferCurrency(priceText, "USD");

  // Extract rating from ReviewStatsContextualized
  let ratingText: string | undefined;
  let reviewCount: string | undefined;
  const reviewStats = document.querySelector('[data-component-name="ReviewStatsContextualized"]');
  if (reviewStats) {
    // Try span.font-weight-bold (e.g., "5.0")
    const ratingSpan = reviewStats.querySelector('span.font-weight-bold');
    ratingText = ratingSpan?.textContent?.trim();
    
    // Fallback: try visually-hidden text (e.g., "Rating 5 out of 5 stars")
    if (!ratingText) {
      const hiddenText = reviewStats.querySelector('p.visually-hidden')?.textContent || '';
      const ratingMatch = hiddenText.match(/Rating\s+(\d+(?:\.\d+)?)\s+out\s+of/i);
      if (ratingMatch) {
        ratingText = ratingMatch[1];
      }
    }
    
    // Extract review count from span.c-reviews (e.g., "(1 review)")
    const reviewSpan = reviewStats.querySelector('span.c-reviews');
    const reviewText = reviewSpan?.textContent?.trim() || '';
    const countMatch = reviewText.match(/(\d+)\s*review/i);
    if (countMatch) {
      reviewCount = countMatch[1];
    }
    
    // Fallback: try visually-hidden text
    if (!reviewCount) {
      const hiddenText = reviewStats.querySelector('p.visually-hidden')?.textContent || '';
      const countMatch = hiddenText.match(/(\d+)\s+review/i);
      if (countMatch) {
        reviewCount = countMatch[1];
      }
    }
  }
  
  // Fallback to generic selectors
  if (!ratingText) {
    ratingText = textFromSelectors([
      ".c-review-average",
      ".ugc-c-review-average",
      "[data-automation=overall-rating]",
    ]);
  }
  
  if (!reviewCount) {
    reviewCount = textFromSelectors([
      ".c-review-count",
      ".ugc-c-review-count",
      "[data-automation=review-count]",
    ]);
  }

  const keySpecs = extractBestBuySpecs();
  // Use extracted brand/model or fallback to specs
  brand = brand || keySpecs?.Brand || keySpecs?.["Brand Name"];
  model = model || keySpecs?.Model || keySpecs?.["Model Number"];

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
      "[data-component-name=CustomerReviewListSection] #review-list li p",
      "#review-list li p",
      "[data-testid=enhanced-review-content]",
      "[data-testid=review-card]",
      ".ugc-review-body",
      ".review-text",
      ".review-item",
    ]),
    shipping_returns: extractBestBuyShipping(),
  };
};
