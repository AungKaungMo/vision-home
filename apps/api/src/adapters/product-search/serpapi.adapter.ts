import { CONFIG } from "@/core/config";
import type {
  ProductListing,
  ProductSearchPort,
} from "@/ports/product-search.port";

const ENDPOINT = "https://serpapi.com/search.json";

type GoogleShoppingResult = {
  title?: string;
  price?: string;
  thumbnail?: string;
  source?: string;
  link?: string;
  product_link?: string;
};

type SerpResponse = { shopping_results?: GoogleShoppingResult[] };

export const serpapiProductSearch: ProductSearchPort = {
  async searchTopProduct(query) {
    if (!CONFIG.SERPAPI_KEY) {
      throw new Error("SERPAPI_KEY is not configured");
    }

    const params = new URLSearchParams({
      engine: "google_shopping",
      q: query,
      api_key: CONFIG.SERPAPI_KEY,
      num: "10",
    });

    const response = await fetch(`${ENDPOINT}?${params.toString()}`);
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`serpapi failed (${response.status}): ${detail}`);
    }

    const data = (await response.json()) as SerpResponse;
    // Prefer the first result that actually links somewhere buyable.
    const top = data.shopping_results?.find(
      (result) => result.product_link ?? result.link,
    );
    const buyUrl = top?.product_link ?? top?.link;
    if (!top || !buyUrl) {
      return null;
    }

    return {
      title: top.title ?? query,
      imageUrl: top.thumbnail ?? null,
      price: top.price ?? null,
      source: top.source ?? null,
      buyUrl,
    } satisfies ProductListing;
  },
};
