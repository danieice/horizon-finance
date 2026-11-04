import { CreditCard, Home, Send, Shield, type LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/cards", label: "Cards", icon: CreditCard },
  { href: "/transfers", label: "Send", icon: Send },
  { href: "/security", label: "Security", icon: Shield },
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}