"use client";
import { Menu, Bell, ShieldCheck } from "lucide-react";
import { useUIStore } from "@/store";

interface AdminTopBarProps {
  title?: string;
  subtitle?: string;
}

export function AdminTopBar({
  title = "Dashboard",
  subtitle = "Showroom Overview",
}: AdminTopBarProps) {
  const { toggleAdminSidebar } = useUIStore();

  return (
    <header className="sticky top-0 z-10 bg-[#fcf9f4] border-b border-[#ebe3d5] px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Hamburger */}
        <button
          onClick={toggleAdminSidebar}
          className="lg:hidden w-11 h-11 flex items-center justify-center text-[#2b1e1a] hover:bg-[#f0ede9] border border-[#ebe3d5] active:bg-[#e5e2dd]"
          aria-label="Toggle admin sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-lg sm:text-xl font-medium text-[#2b1e1a] leading-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-[#867273] mt-0.5 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Staff Status & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#f0ede9] border border-[#ebe3d5] text-xs font-medium text-[#2b1e1a]">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Varanasi Atelier Staff</span>
        </div>

        <button
          className="w-10 h-10 flex items-center justify-center text-[#534343] hover:text-[#2b1e1a] hover:bg-[#f0ede9] relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#5c1d24] rounded-full" />
        </button>
      </div>
    </header>
  );
}

