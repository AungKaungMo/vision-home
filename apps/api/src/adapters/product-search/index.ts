import { CONFIG } from "@/core/config";
import type { ProductSearchPort } from "@/ports/product-search.port";

import { fakeProductSearch } from "@/adapters/product-search/fake.adapter";
import { serperProductSearch } from "@/adapters/product-search/serper.adapter";

export const productSearch: ProductSearchPort = CONFIG.USE_FAKE_ADAPTERS
  ? fakeProductSearch
  : serperProductSearch;
