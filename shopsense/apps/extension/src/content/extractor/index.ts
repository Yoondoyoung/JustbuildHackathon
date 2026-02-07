import type { Extracted } from "../../shared/types";
import { extractAmazon } from "./siteAdapters/amazon";
import { extractBestBuy } from "./siteAdapters/bestbuy";
import { extractGeneric } from "./siteAdapters/generic";
import { extractWalmart } from "./siteAdapters/walmart";

type Adapter = () => Partial<Extracted>;

const resolveAdapter = (host: string): Adapter | null => {
  const normalized = host.toLowerCase();
  if (normalized.includes("amazon.")) return extractAmazon;
  if (normalized.includes("walmart.")) return extractWalmart;
  if (normalized.endsWith("bestbuy.com")) return extractBestBuy;
  return null;
};

const mergeExtracted = (
  generic: Partial<Extracted>,
  specific: Partial<Extracted>,
): Extracted => {
  const mergedSpecs = {
    ...(generic.key_specs ?? {}),
    ...(specific.key_specs ?? {}),
  };

  return {
    page_url: location.href,
    store_domain: location.host,
    title: specific.title ?? generic.title,
    brand: specific.brand ?? generic.brand,
    model: specific.model ?? generic.model,
    price: specific.price ?? generic.price,
    rating: specific.rating ?? generic.rating,
    review_count: specific.review_count ?? generic.review_count,
    key_specs: Object.keys(mergedSpecs).length > 0 ? mergedSpecs : undefined,
    visible_reviews:
      specific.visible_reviews?.length
        ? specific.visible_reviews
        : generic.visible_reviews,
    shipping_returns: specific.shipping_returns ?? generic.shipping_returns,
  };
};

export const extractPage = (): Extracted => {
  const generic = extractGeneric();
  const adapter = resolveAdapter(location.host);
  const specific = adapter ? adapter() : {};
  return mergeExtracted(generic, specific);
};
