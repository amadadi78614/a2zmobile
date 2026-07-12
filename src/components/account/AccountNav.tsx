"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, MapPin, RotateCcw, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/returns", label: "Returns", icon: RotateCcw },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-line pb-2 lg:w-56 lg:flex-col lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
      {links.map((l) => {
        const active = pathname === l.href;
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 px-3 py-2.5 text-sm whitespace-nowrap",
              active ? "bg-ink text-paper" : "text-ink-500 hover:bg-mist"
            )}
          >
            <Icon size={16} />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
