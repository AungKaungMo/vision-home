import Link from "next/link";
import { Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-surface-warm px-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <span className="font-display text-6xl text-terracotta">404</span>
        <h1 className="font-display text-2xl text-fg-1">
          This page doesn&apos;t exist
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-fg-2">
          The page you&apos;re looking for may have moved, or the link is out of
          date.
        </p>
        <Button render={<Link href="/home" />} className="mt-2">
          <Home aria-hidden strokeWidth={2.25} />
          Back to home
        </Button>
      </div>
    </main>
  );
}
