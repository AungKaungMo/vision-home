import { CONFIG } from "@/core/config";
import type {
  ProductListing,
  ProductSearchPort,
} from "@/ports/product-search.port";

const ENDPOINT = "https://google.serper.dev/shopping";

type SerperShoppingItem = {
  title?: string;
  source?: string;
  link?: string;
  price?: string;
  imageUrl?: string;
};

type SerperResponse = { shopping?: SerperShoppingItem[] };

export const serperProductSearch: ProductSearchPort = {
  async searchTopProduct(query) {
    if (!CONFIG.SERPER_API_KEY) {
      throw new Error("SERPER_API_KEY is not configured");
    }

    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "X-API-KEY": CONFIG.SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`serper failed (${response.status}): ${detail}`);
    }

    const data = (await response.json()) as SerperResponse;
    const top = data.shopping?.find((item) => item.link);
    if (!top?.link) {
      return null;
    }

    return {
      title: top.title ?? query,
      imageUrl: top.imageUrl ?? null,
      price: top.price ?? null,
      source: top.source ?? null,
      buyUrl: top.link,
    } satisfies ProductListing;
  },
};
