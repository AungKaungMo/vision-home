import { Home, User, Wand2, type LucideIcon } from "lucide-react";

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
    items: [{ label: "Home", href: "/home", icon: Home }],
  },
  {
    heading: "Tools",
    items: [{ label: "AI Studio", href: "/ai-studio", icon: Wand2 }],
  },
  {
    heading: "Account",
    items: [{ label: "Profile", href: "/profile", icon: User }],
  },
];
