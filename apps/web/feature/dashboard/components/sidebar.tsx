"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Star } from "lucide-react";

import { NAV_SECTIONS, type NavItem } from "@/feature/dashboard/constants";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar px-4 py-6">
      <Link href="/home" className="flex items-center gap-3 px-2">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-terracotta text-white shadow-primary">
          <House aria-hidden className="size-5" strokeWidth={2.25} />
        </span>
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg text-fg-1">VisionHome</span>
          <span className="mt-1 text-xs font-medium tracking-wider text-fg-3 uppercase">
            Design Studio
          </span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.heading} className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-xs font-semibold tracking-wider text-fg-3 uppercase">
              {section.heading}
            </p>
            {section.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)
                }
              />
            ))}
          </div>
        ))}
      </nav>

      <StudioPlanCard />
    </aside>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-fast",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-fg-2 hover:bg-sidebar-accent/50 hover:text-fg-1",
      )}
    >
      {active && (
        <span className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-terracotta" />
      )}
      <Icon aria-hidden className="size-4.5 shrink-0" strokeWidth={2} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span className="rounded-full bg-terracotta px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function StudioPlanCard() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-sidebar-border bg-surface px-3 py-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-terracotta-muted text-terracotta">
        <Star aria-hidden className="size-4" strokeWidth={2.25} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-fg-1">Studio plan</span>
        <span className="text-xs text-fg-3">Manage plan &amp; billing</span>
      </span>
    </div>
  );
}
