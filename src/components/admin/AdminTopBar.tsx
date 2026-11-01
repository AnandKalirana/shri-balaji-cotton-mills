"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Bell, ShieldCheck } from "lucide-react";
import { useUIStore } from "@/store";

interface AdminTopBarProps {
  title?: string;
  subtitle?: string;
}

const pageTitles: { prefix: string; title: string; subtitle: string }[] = [
  { prefix: "/admin/orders", title: "Orders", subtitle: "Fulfilment and deliveries" },
  { prefix: "/admin/products", title: "Products", subtitle: "Your catalogue" },
  { prefix: "/admin/inventory", title: "Fabric & Stock", subtitle: "Inventory levels" },
  { prefix: "/admin/cms", title: "Banners & CMS", subtitle: "Storefront content" },
  { prefix: "/admin/coupons", title: "Coupons", subtitle: "Discount codes" },
  { prefix: "/admin/settings", title: "Settings", subtitle: "Store preferences" },
];

const roleLabels: Record<string, string> = {
  ADMIN: "Owner",
  STAFF: "Staff",
  CUSTOMER: "Customer",
};

export function AdminTopBar({
  title = "Dashboard",
  subtitle = "Showroom Overview",
}: AdminTopBarProps) {
  const { toggleAdminSidebar } = useUIStore();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setRole(d.user?.role ?? null))
      .catch(() => setRole(null));
  }, []);

  const match = pageTitles.find((p) => pathname?.startsWith(p.prefix));
  const pageTitle = match?.title ?? title;
  const pageSubtitle = match?.subtitle ?? subtitle;

  return (
    <header className="sticky top-0 z-10 bg-[#fcf9f4]/75 backdrop-blur-xl backdrop-saturate-150 border-b border-[#ebe3d5]/70 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Hamburger */}
        <button
          onClick={toggleAdminSidebar}
          className="lg:hidden w-11 h-11 rounded-full flex items-center justify-center text-[#2b1e1a] hover:bg-[#2b1e1a]/5 active:scale-95 transition-all"
          aria-label="Toggle admin sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-lg sm:text-xl font-medium text-[#2b1e1a] leading-none">
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="text-[11px] text-[#867273] mt-1 hidden sm:block">
              {pageSubtitle}
            </p>
          )}
        </div>
      </div>

      {/* Role badge & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {role && (
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2b1e1a]/[0.06] text-xs font-medium text-[#2b1e1a]">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{roleLabels[role] ?? role}</span>
          </div>
        )}

        <button
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#534343] hover:text-[#2b1e1a] hover:bg-[#2b1e1a]/5 active:scale-95 transition-all relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#5c1d24] rounded-full ring-2 ring-[#fcf9f4]" />
        </button>
      </div>
    </header>
  );
}
