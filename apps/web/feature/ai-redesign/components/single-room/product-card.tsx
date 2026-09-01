import Image from "next/image";

import { Button } from "@/components/ui/button";

export type ShopProduct = {
  category: string;
  imageUrl: string;
  name: string;
  price: string;
};

export function ProductCard({ product }: { product: ShopProduct }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
          className="object-cover transition-transform duration-base hover:scale-[1.02]"
          unoptimized
        />
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-wide text-fg-2 uppercase shadow-sm backdrop-blur-sm">
          {product.category}
        </span>
      </div>

      <div className="flex items-end justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-body text-base font-semibold text-fg-1">
            {product.name}
          </h3>
          <p className="mt-2 text-md font-semibold text-terracotta">
            {product.price}
          </p>
        </div>

        <Button
          type="button"
          className="h-9 shrink-0 rounded-full bg-fg-1 px-4 text-sm font-semibold text-fg-inverse hover:bg-fg-2"
        >
          Buy
        </Button>
      </div>
    </article>
  );
}
