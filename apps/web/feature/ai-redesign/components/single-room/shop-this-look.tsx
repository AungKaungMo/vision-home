"use client";

import { Sparkles } from "lucide-react";

import { ProductCard } from "@/feature/ai-redesign/components/single-room/product-card";
import { useGenerationProducts } from "@/feature/ai-redesign/hooks/queries/use-generation-products";

export function ShopThisLook({ generationId }: { generationId: string }) {
  const { data, isLoading, isError } = useGenerationProducts(generationId);
  const products = data?.products ?? [];

  // Secondary feature: if detection fails or finds nothing, stay out of the way.
  if (isError || (!isLoading && products.length === 0)) {
    return null;
  }

  return (
    <section aria-labelledby="shop-this-look-heading" className="pt-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2
          id="shop-this-look-heading"
          className="font-display text-2xl text-fg-1"
        >
          Shop this look
        </h2>
        {!isLoading && (
          <p className="text-sm text-fg-3">
            {products.length} products found in your generated design
          </p>
        )}
      </div>

      <p className="mt-2 flex items-start gap-2 text-sm text-fg-3">
        <Sparkles
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-terracotta"
          strokeWidth={2}
        />
        {isLoading
          ? "Scanning your redesign for shoppable pieces…"
          : "AI spotted these pieces in your redesign — tap to shop similar ones."}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-2xl border border-border bg-muted"
              />
            ))
          : products.map((product) => (
              <ProductCard
                key={`${product.category}:${product.name}`}
                product={product}
              />
            ))}
      </div>
    </section>
  );
}
