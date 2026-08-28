"use client";

import { Avatar } from "@base-ui/react/avatar";
import { ChevronDown, CreditCard, LogOut, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfileMenu } from "@/feature/dashboard/hooks/use-profile-menu";
import { cn } from "@/lib/utils";

export function ProfileMenu() {
  const {
    isLoaded,
    name,
    email,
    initials,
    imageUrl,
    goToProfile,
    goToSubscription,
    signOut,
  } = useProfileMenu();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2 rounded-full border border-border bg-surface py-1 pr-2.5 pl-1 transition-colors duration-fast",
          "hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none",
        )}
      >
        <span className="relative">
          <Avatar.Root className="grid size-8 place-items-center overflow-hidden rounded-full bg-terracotta-muted text-sm font-semibold text-terracotta">
            <Avatar.Image
              src={imageUrl}
              alt={name}
              className="size-full object-cover"
            />
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          </Avatar.Root>
          <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-surface bg-success" />
        </span>
        <span className="hidden text-sm font-semibold text-fg-1 sm:inline">
          {isLoaded ? name : "…"}
        </span>
        <ChevronDown aria-hidden className="size-4 text-fg-3" />
      </DropdownMenuTrigger>

      <DropdownMenuContent sideOffset={8} align="end" className="min-w-56">
        <div className="flex flex-col px-3 py-2">
          <span className="truncate text-sm font-semibold text-fg-1">
            {name}
          </span>
          {email && <span className="truncate text-xs text-fg-3">{email}</span>}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={goToProfile}>
          <User aria-hidden className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={goToSubscription}>
          <CreditCard aria-hidden className="size-4" />
          Subscription
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={signOut}>
          <LogOut aria-hidden className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
