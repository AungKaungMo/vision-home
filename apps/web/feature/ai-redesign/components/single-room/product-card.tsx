import { ArrowUpRight } from "lucide-react";

import type { ShopProduct } from "@repo/schemas/designs";

export function ProductCard({ product }: { product: ShopProduct }) {
  return (
    <a
      href={product.buyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-colors hover:border-terracotta"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.imageUrl ? (
          // Retailer thumbnails come from arbitrary shopping hosts, so a plain
          // <img> avoids per-domain next/image allowlisting.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-base group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-fg-3">
            No image
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-wide text-fg-2 uppercase shadow-sm backdrop-blur-sm">
          {product.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="truncate font-body text-base font-semibold text-fg-1">
          {product.name}
        </h3>

        <div className="mt-1 flex items-end justify-between gap-2">
          <div className="min-w-0">
            {product.price && (
              <p className="text-md font-semibold text-terracotta">
                {product.price}
              </p>
            )}
            {product.source && (
              <p className="truncate text-xs text-fg-3">{product.source}</p>
            )}
          </div>

          <span className="flex shrink-0 items-center gap-1 rounded-full bg-fg-1 px-3 py-1.5 text-sm font-semibold text-fg-inverse transition-colors group-hover:bg-fg-2">
            Buy
            <ArrowUpRight aria-hidden className="size-4" strokeWidth={2} />
          </span>
        </div>
      </div>
    </a>
  );
}
