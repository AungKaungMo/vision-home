import { Sparkles } from "lucide-react";

import {
  ProductCard,
  type ShopProduct,
} from "@/feature/ai-redesign/components/single-room/product-card";

const PRODUCTS: ShopProduct[] = [
  {
    category: "Seating",
    imageUrl:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=85",
    name: "Linen Lounge Chair",
    price: "$640",
  },
  {
    category: "Tables",
    imageUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85",
    name: "Travertine Coffee Table",
    price: "$1,140",
  },
  {
    category: "Lighting",
    imageUrl:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
    name: "Paper Floor Lamp",
    price: "$280",
  },
  {
    category: "Plants",
    imageUrl:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=85",
    name: "Monstera, Large",
    price: "$78",
  },
];

export function ShopThisLook() {
  return (
    <section aria-labelledby="shop-this-look-heading" className="pt-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2
          id="shop-this-look-heading"
          className="font-display text-2xl text-fg-1"
        >
          Shop this look
        </h2>
        <p className="text-sm text-fg-3">
          {PRODUCTS.length} products matched from your generated design
        </p>
      </div>

      <p className="mt-2 flex items-start gap-2 text-sm text-fg-3">
        <Sparkles
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-terracotta"
          strokeWidth={2}
        />
        AI identified these real products in your redesign — buy them to bring
        it to life.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.name} product={product} />
        ))}
      </div>
    </section>
  );
}
