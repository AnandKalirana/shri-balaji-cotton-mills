"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Image as ImageIcon,
  Tag,
  Settings,
  Store,
  X,
  LogOut,
} from "lucide-react";
import { useUIStore } from "@/store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Fabric & Stock", icon: Layers },
  { href: "/admin/cms", label: "Banners & CMS", icon: ImageIcon },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { adminSidebarOpen, closeAdminSidebar } = useUIStore();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between bg-[#281b17] text-[#faf7f2] select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 md:h-20 flex items-center justify-between px-6 border-b border-[#53433e]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c5a880] inline-block" />
            <span className="font-[family-name:var(--font-playfair)] text-sm font-semibold text-white tracking-wide">
              Shri Balaji Cotton Mills
            </span>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={closeAdminSidebar}
            className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-[#d8c2bb] hover:text-white hover:bg-white/10"
            aria-label="Close admin menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1" aria-label="Admin navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeAdminSidebar}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[46px]",
                  isActive
                    ? "bg-[#5c1d24] text-white shadow-[0_8px_20px_-10px_rgba(0,0,0,0.6)]"
                    : "text-[#d8c2bb] hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4 shrink-0 text-[#c5a880]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-[#53433e] space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[#d8c2bb] hover:text-white hover:bg-white/5 transition-colors"
        >
          <Store className="w-4 h-4 text-[#c5a880]" />
          <span>View Live Store</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[#d8c2bb] hover:text-rose-300 hover:bg-white/5 transition-colors text-left"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Sign Out</span>
        </button>

        <p className="text-[10px] text-[#867273] px-4 pt-2">
          Shri Balaji Cotton Mills v1.0
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-60 shrink-0 border-r border-[#53433e] h-screen sticky top-0 overflow-y-auto z-20">
        {navContent}
      </aside>

      {/* Mobile Slide-out Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
          adminSidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-[#2b1e1a]/80 backdrop-blur-[2px] transition-opacity duration-300",
            adminSidebarOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={closeAdminSidebar}
        />
        <div
          className={cn(
            "absolute top-0 left-0 bottom-0 w-4/5 max-w-xs shadow-2xl transition-transform duration-300 ease-out",
            adminSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {navContent}
        </div>
      </div>
    </>
  );
}

