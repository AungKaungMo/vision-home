"use client";

import { Bell, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/feature/dashboard/components/profile-menu";
import { ThemeToggle } from "@/feature/dashboard/components/theme-toggle";

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-surface px-6">
      <label className="relative flex w-full max-w-md items-center">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3.5 size-4 text-fg-3"
        />
        <input
          type="search"
          aria-label="Search"
          placeholder="Search styles, rooms, designers…"
          className="h-10 w-full rounded-full border border-border bg-surface-warm pr-4 pl-10 text-sm text-fg-1 transition-colors duration-fast placeholder:text-fg-3 hover:border-border-strong focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 focus-visible:outline-none"
        />
      </label>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
        >
          <Bell aria-hidden className="size-4.5" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full border-2 border-surface bg-terracotta" />
        </Button>
        <div className="mx-1 h-6 w-px bg-divider" />
        <ProfileMenu />
      </div>
    </header>
  );
}
