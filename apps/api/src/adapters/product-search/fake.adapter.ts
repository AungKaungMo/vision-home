import type { ProductSearchPort } from "@/ports/product-search.port";

/** Local/dev stand-in: a deterministic placeholder listing, no network. */
export const fakeProductSearch: ProductSearchPort = {
  async searchTopProduct(query) {
    const seed = encodeURIComponent(query);
    // Price derived from the query so dev output is stable across runs.
    const price = 50 + ((query.length * 37) % 450);

    return {
      title: query,
      imageUrl: `https://picsum.photos/seed/${seed}/400/400`,
      price: `$${price}`,
      source: "Example Store",
      buyUrl: `https://www.google.com/search?tbm=shop&q=${seed}`,
    };
  },
};
