"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Boxes,
  ShoppingCart,
  Users,
  LayoutTemplate,
  Image as ImageIcon,
  Percent,
  BarChart3,
  LogOut,
} from "lucide-react";
import { AdminRole } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const nav: { href: string; label: string; icon: typeof LayoutDashboard; roles: AdminRole[] }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["owner", "administrator", "inventory", "sales", "marketing", "read_only"] },
  { href: "/admin/products", label: "Products", icon: Package, roles: ["owner", "administrator", "inventory", "read_only"] },
];

// Modules from the Phase 4 brief not yet built in Sprint 4A. Shown as a
// disabled roadmap list rather than live links, so the sidebar never ships
// a link to a route that 404s.
const upcoming: { label: string; icon: typeof LayoutDashboard }[] = [
  { label: "Categories", icon: FolderTree },
  { label: "Brands", icon: Tag },
  { label: "Inventory", icon: Boxes },
  { label: "Orders", icon: ShoppingCart },
  { label: "Customers", icon: Users },
  { label: "Homepage CMS", icon: LayoutTemplate },
  { label: "Media Library", icon: ImageIcon },
  { label: "Promotions", icon: Percent },
  { label: "Reports", icon: BarChart3 },
];

export function AdminSidebar({ role, fullName }: { role: AdminRole; fullName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-line bg-paper">
      <div className="border-b border-line px-5 py-5">
        <span className="font-display text-lg font-semibold">A2Z Admin</span>
        <p className="mt-1 text-xs text-ink-400">{fullName}</p>
        <span className="mt-1 inline-block bg-mist px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-500">
          {role.replace("_", " ")}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {nav
          .filter((item) => item.roles.includes(role))
          .map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-5 py-2.5 text-sm",
                  active ? "bg-ink text-paper" : "text-ink-500 hover:bg-mist"
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}

        <p className="mt-6 px-5 text-[10px] font-semibold uppercase tracking-widest2 text-ink-400">
          Coming Soon
        </p>
        {upcoming.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex cursor-not-allowed items-center gap-3 px-5 py-2.5 text-sm text-ink-400/50"
              title="Not yet built — see roadmap"
            >
              <Icon size={16} />
              {item.label}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-2 py-2.5 text-sm text-ink-500 hover:text-secondary"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
