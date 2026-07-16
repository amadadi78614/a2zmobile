"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, MapPin, RotateCcw, User, Bell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

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
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-line pb-2 lg:w-56 lg:flex-col lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
      {links.map((link) => {
        const active = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 whitespace-nowrap px-3 py-2.5 text-sm",
              active ? "bg-ink text-paper" : "text-ink-500 hover:bg-mist"
            )}
          >
            <Icon size={16} />
            {link.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={signOut}
        className="flex shrink-0 items-center gap-2.5 whitespace-nowrap px-3 py-2.5 text-left text-sm text-ink-500 hover:bg-mist"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </nav>
  );
}
