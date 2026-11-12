"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useLiveStoreInfo } from "@/lib/use-live-store-info";
import { Search, Heart, ShoppingBag, Menu, X, User } from "lucide-react";
import { SearchPanel } from "@/components/store/SearchPanel";
import { useCartStore, useUIStore } from "@/store";
import { categories } from "@/lib/data";
import { cn } from "@/lib/utils";

export function StoreHeader({
  announcement: initialAnnouncement,
  storeName: initialName = "Shri Balaji Cotton Mills",
}: {
  announcement?: string | null;
  storeName?: string;
}) {
  const live = useLiveStoreInfo({
    storeName: initialName,
    supportPhone: "",
    supportEmail: "",
    legalName: "",
    gstin: "",
    address: "",
    businessHours: "",
    instagramUrl: "",
    facebookUrl: "",
    youtubeUrl: "",
    announcementText: initialAnnouncement ?? "",
    enableAnnouncement: Boolean(initialAnnouncement),
  });
  const storeName = live.storeName;
  const announcement = live.enableAnnouncement && live.announcementText ? live.announcementText : null;
  const [scrolled, setScrolled] = useState(false);
  const isHome = usePathname() === "/";
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, toggleCart } = useCartStore();
  const { mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change equivalent
  useEffect(() => {
    closeMobileMenu();
  }, [closeMobileMenu]);

  const count = itemCount();
  // On the home page the header sits on top of the hero photo until the visitor scrolls.
  const [lightHero, setLightHero] = useState(false);
  useEffect(() => {
    const read = () => setLightHero(document.documentElement.dataset.heroTone === "light");
    read();
    window.addEventListener("hero-tone", read);
    return () => window.removeEventListener("hero-tone", read);
  }, []);
  const overlay = isHome && !scrolled && !mobileMenuOpen;
  // White logo and links only when the photo behind them is dark.
  const whiteInk = overlay && !lightHero;

  return (
    <>
      {/* Announcement Bar */}
      {announcement && (
        <div className="bg-black text-white text-center py-2.5 px-4 text-xs font-medium">
          {announcement}
        </div>
      )}

      {/* Main Header */}
      <header
        data-overlay={whiteInk ? "true" : "false"}
        className={cn(
          "group/hdr sticky top-0 z-30 bg-white/70 backdrop-blur-xl backdrop-saturate-150 transition-[background-color,box-shadow] duration-300",
          isHome && "-mb-16 md:-mb-20",
          overlay && "bg-transparent backdrop-blur-none backdrop-saturate-100",
          scrolled && "shadow-bar"
        )}
      >
        <div className={cn("border-b transition-colors duration-300", scrolled || overlay ? "border-transparent" : "border-black/10")}>
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex items-center justify-between h-16 md:h-20">

              {/* Mobile: Hamburger */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-ink group-data-[overlay=true]/hdr:text-white group-data-[overlay=true]/hdr:hover:bg-white/15 hover:bg-black/5 transition-colors"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Logo */}
              <Link
                href="/"
                className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:mr-8"
              >
                <Logo tone={whiteInk ? "light" : "dark"} alt={storeName} priority className="h-7 sm:h-8 md:h-9" />
              </Link>

              {/* Desktop: category links sit on the left, next to the logo */}
              <nav className="hidden lg:flex items-center gap-1 flex-1" aria-label="Main navigation">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="px-2.5 xl:px-3 py-2 text-[13px] xl:text-sm font-semibold text-ink group-data-[overlay=true]/hdr:text-white underline-offset-[10px] hover:underline whitespace-nowrap"
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>

              {/* Icons */}
              <div className="flex items-center gap-0">
                {/* Search: a pill on wide screens, an icon on small ones */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className="hidden xl:flex items-center gap-3 h-11 w-64 mr-3 px-4 rounded-full bg-ink/[0.06] text-graphite group-data-[overlay=true]/hdr:bg-white/25 group-data-[overlay=true]/hdr:text-white group-data-[overlay=true]/hdr:backdrop-blur-md hover:bg-ink/10 group-data-[overlay=true]/hdr:hover:bg-white/35 transition-colors text-sm"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 shrink-0" />
                  <span>Search</span>
                </button>
                <button
                  onClick={() => setSearchOpen(true)}
                  className="xl:hidden w-10 h-10 rounded-full flex items-center justify-center text-ink group-data-[overlay=true]/hdr:text-white group-data-[overlay=true]/hdr:hover:bg-white/15 hover:bg-ink/5 active:scale-95 transition-[transform,background-color]"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Wishlist — hidden on smallest mobile */}
                <Link
                  href="/wishlist"
                  className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-ink group-data-[overlay=true]/hdr:text-white group-data-[overlay=true]/hdr:hover:bg-white/15 hover:bg-black/5 transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* Account */}
                <Link
                  href="/account"
                  className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-ink group-data-[overlay=true]/hdr:text-white group-data-[overlay=true]/hdr:hover:bg-white/15 hover:bg-black/5 transition-colors"
                  aria-label="My account"
                >
                  <User className="w-5 h-5" />
                </Link>

                {/* Cart */}
                <button
                  onClick={toggleCart}
                  className="relative w-10 h-10 rounded-full flex items-center justify-center text-ink group-data-[overlay=true]/hdr:text-white group-data-[overlay=true]/hdr:hover:bg-white/15 hover:bg-black/5 transition-colors"
                  aria-label={`Shopping cart, ${count} item${count !== 1 ? "s" : ""}`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {count > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-wine text-white text-[9px] font-semibold flex items-center justify-center rounded-full">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Secondary nav row (tablet condensed) */}
        <div className="hidden md:flex lg:hidden border-b border-line group-data-[overlay=true]/hdr:border-white/20 overflow-x-auto scrollbar-none">
          <nav className="flex items-center px-6 gap-0 min-w-max" aria-label="Category navigation">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="px-4 py-2.5 text-[13px] font-medium text-graphite group-data-[overlay=true]/hdr:text-white hover:text-ink whitespace-nowrap hover:bg-black/5 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-opacity duration-300",
          mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-ink/70 backdrop-blur-[2px] transition-opacity duration-300",
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={closeMobileMenu}
        />

        {/* Panel */}
        <nav
          className={cn(
            "absolute top-0 left-0 bottom-0 w-4/5 max-w-xs bg-white flex flex-col transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
          aria-label="Mobile navigation"
        >
          {/* Logo in drawer */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-line">
            <Logo alt={storeName} className="h-7" />
            <button
              onClick={closeMobileMenu}
              className="w-10 h-10 flex items-center justify-center text-graphite hover:bg-black/5 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Categories */}
          <div className="flex-1 overflow-y-auto py-2">
            <p className="px-6 py-3 text-xs font-medium text-muted">
              Shop by Category
            </p>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                onClick={closeMobileMenu}
                className="flex items-center px-6 py-3.5 text-sm font-medium text-ink hover:bg-mist border-b border-line last:border-0 transition-colors min-h-[52px]"
              >
                {cat.name}
              </Link>
            ))}

            {/* Quick links */}
            <div className="mt-4 border-t border-line">
              <p className="px-6 py-3 text-xs font-medium text-muted">
                Account
              </p>
              {[
                { href: "/account", label: "My Account" },
                { href: "/wishlist", label: "Wishlist" },
                { href: "/orders", label: "My Orders" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="flex items-center px-6 py-3.5 text-sm font-medium text-graphite hover:bg-mist hover:text-ink transition-colors min-h-[52px]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-line">
            <p className="text-xs text-muted">© 2026 {storeName}</p>
          </div>
        </nav>
      </div>

      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
