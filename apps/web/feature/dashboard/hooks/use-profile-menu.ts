"use client";

import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";

import { SIGN_IN_URL } from "@/feature/auth/constants";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function useProfileMenu() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const name = user?.fullName ?? user?.username ?? "Guest";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials = getInitials(name) || "VH";

  return {
    isLoaded,
    name,
    email,
    initials,
    imageUrl: user?.imageUrl,
    goToProfile: () => router.push("/profile"),
    goToSubscription: () => router.push("/subscription"),
    signOut: () => signOut({ redirectUrl: SIGN_IN_URL }),
  };
}
