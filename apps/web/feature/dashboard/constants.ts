import {
  Bookmark,
  Compass,
  CreditCard,
  Home,
  LayoutGrid,
  Sparkles,
  User,
  Wand2,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavSection = {
  heading: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    heading: "Menu",
    items: [
      { label: "Home", href: "/home", icon: Home },
      { label: "For You", href: "/for-you", icon: Sparkles },
      { label: "Explore", href: "/explore", icon: Compass },
    ],
  },
  {
    heading: "Tools",
    items: [
      { label: "AI Redesign", href: "/ai-redesign", icon: Wand2 },
      {
        label: "Whole House",
        href: "/ai-redesign/new/whole-house",
        icon: LayoutGrid,
      },
      {
        label: "Place it yourself",
        href: "/ai-redesign/new/place-it-yourself",
        icon: Sparkles,
        badge: "New",
      },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Saved", href: "/saved", icon: Bookmark },
      { label: "Profile", href: "/profile", icon: User },
      { label: "Subscription", href: "/subscription", icon: CreditCard },
    ],
  },
];
