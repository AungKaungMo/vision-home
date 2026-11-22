import { ArrowUpRight } from "lucide-react";

import type { DetectedProduct } from "@repo/schemas/designs";

/** Link out to a shopping search — we surface what's in the render, not inventory. */
function searchUrl(product: DetectedProduct) {
  const query = `${product.name} ${product.category}`;
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;
}

export function ProductCard({ product }: { product: DetectedProduct }) {
  return (
    <a
      href={searchUrl(product)}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-terracotta"
    >
      <div className="min-w-0">
        <span className="text-xs font-semibold tracking-wide text-fg-3 uppercase">
          {product.category}
        </span>
        <h3 className="mt-1 truncate font-body text-base font-semibold text-fg-1">
          {product.name}
        </h3>
      </div>

      <span className="flex shrink-0 items-center gap-1 rounded-full bg-fg-1 px-3 py-1.5 text-sm font-semibold text-fg-inverse transition-colors group-hover:bg-fg-2">
        Shop
        <ArrowUpRight aria-hidden className="size-4" strokeWidth={2} />
      </span>
    </a>
  );
}
