"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Ticket,
  Megaphone,
  Star,
  Users,
  Mail,
  LogOut,
} from "lucide-react";
import { useAdminAuth } from "@/lib/useAdminAuth";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/categories", label: "Categories", icon: Tags },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/coupons", label: "Coupons", icon: Ticket },
  { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/newsletter", label: "Newsletter", icon: Mail },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, email } = useAdminAuth();

  if (pathname === "/dashboard/login") return <>{children}</>;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/dashboard/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <span className="font-mono text-xs text-beige-dim uppercase tracking-widest-plus">Loading…</span>
      </div>
    );
  }

  if (!email) return null;

  return (
    <div className="min-h-screen flex bg-void">
      <aside className="w-64 shrink-0 border-r border-line bg-surface hidden md:flex flex-col">
        <div className="px-6 py-6 border-b border-line">
          <div className="font-display text-lg tracking-widest-plus text-beige">D_ALLURE</div>
          <p className="font-mono text-[10px] uppercase tracking-widest-plus text-beige-dim mt-1">Admin Console</p>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  active ? "bg-burgundy text-white" : "text-beige-dim hover:text-beige hover:bg-surface-raised"
                }`}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-line">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] uppercase tracking-wider text-beige-dim hover:text-beige transition-colors"
          >
            <LogOut size={15} />
            Log Out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between px-5 py-4 border-b border-line bg-surface">
          <span className="font-display text-base tracking-widest-plus text-beige">D_ALLURE Admin</span>
          <button onClick={handleLogout} className="text-beige-dim">
            <LogOut size={18} />
          </button>
        </div>
        <div className="md:hidden flex gap-1 overflow-x-auto px-5 py-3 border-b border-line bg-surface">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border ${
                pathname === item.href ? "border-beige text-beige" : "border-line text-beige-dim"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="p-6 md:p-10">{children}</div>
      </div>
    </div>
  );
}
