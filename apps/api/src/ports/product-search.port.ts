/** A real, purchasable listing matched to a detected item in a render. */
export type ProductListing = {
  title: string;
  imageUrl: string | null;
  price: string | null;
  /** Retailer name, e.g. "Amazon.com". */
  source: string | null;
  buyUrl: string;
};

export interface ProductSearchPort {
  /**
   * Return the best shopping result for a free-text query, or null when nothing
   * usable is found. Used to turn "linen armchair" into a buyable product.
   */
  searchTopProduct(query: string): Promise<ProductListing | null>;
}
