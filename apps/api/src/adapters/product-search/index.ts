import { CONFIG } from "@/core/config";
import type { ProductSearchPort } from "@/ports/product-search.port";

import { fakeProductSearch } from "@/adapters/product-search/fake.adapter";
import { serpapiProductSearch } from "@/adapters/product-search/serpapi.adapter";

export const productSearch: ProductSearchPort = CONFIG.USE_FAKE_ADAPTERS
  ? fakeProductSearch
  : serpapiProductSearch;
