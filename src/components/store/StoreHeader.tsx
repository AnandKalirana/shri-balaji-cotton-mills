"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/ui/Logo";
import { useLiveStoreInfo } from "@/lib/use-live-store-info";
import { Search, Heart, ShoppingBag, Menu, X, User } from "lucide-react";
import { useCartStore, useUIStore } from "@/store";
import { categories } from "@/lib/data";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

const POPULAR_SEARCHES = ["Cotton Fabric", "Kurta Set", "Kurti", "Stretchy Blouse", "Shapewear", "Men's T-Shirt", "Men's Shirt"];

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ q: string; items: Product[] } | null>(null);
  const trimmed = query.trim();
  const searchActive = trimmed.length >= 2;
  const searching = searchActive && results?.q !== trimmed;
  const { itemCount, toggleCart } = useCartStore();
  const { mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Debounced live search: waits for a pause in typing, then asks the server.
  useEffect(() => {
    if (trimmed.length < 2) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      fetch(`/api/products?search=${encodeURIComponent(trimmed)}&limit=8`)
        .then((r) => r.json())
        .then((d) => !cancelled && setResults({ q: trimmed, items: d.products ?? [] }))
        .catch(() => !cancelled && setResults({ q: trimmed, items: [] }));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  // Close menu on route change equivalent
  useEffect(() => {
    closeMobileMenu();
  }, [closeMobileMenu]);

  const count = itemCount();

  return (
    <>
      {/* Announcement Bar */}
      {announcement && (
        <div className="bg-[#5c1d24] text-white text-center py-2 px-4 text-xs font-medium">
          {announcement}
        </div>
      )}

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-30 bg-[#fcf9f4]/95 transition-shadow duration-300",
          scrolled && "shadow-[0_1px_0_rgba(43,30,26,0.08),0_8px_24px_-12px_rgba(43,30,26,0.18)]"
        )}
      >
        <div className={cn("border-b transition-colors duration-300", scrolled ? "border-transparent" : "border-[#ebe3d5]/70")}>
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex items-center justify-between h-16 md:h-20">

              {/* Mobile: Hamburger */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-[#2b1e1a] hover:bg-[#f0ede9] transition-colors"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Logo */}
              <Link
                href="/"
                className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:flex-1"
              >
                <Logo alt={storeName} priority className="h-7 sm:h-8 md:h-9" />
              </Link>

              {/* Desktop: Category Nav */}
              <nav className="hidden lg:flex items-center gap-0 flex-1 justify-center" aria-label="Main navigation">
                {categories.slice(0, 4).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="px-3.5 py-2 rounded-full text-[13px] font-medium text-[#534343] hover:text-[#2b1e1a] hover:bg-[#2b1e1a]/5 transition-colors whitespace-nowrap"
                  >
                    {cat.name}
                  </Link>
                ))}
                {categories.length > 4 && (
                  <div className="relative group">
                    <button
                      type="button"
                      className="px-3.5 py-2 rounded-full text-[13px] font-medium text-[#534343] group-hover:text-[#2b1e1a] group-hover:bg-[#2b1e1a]/5 group-focus-within:bg-[#2b1e1a]/5 transition-colors"
                      aria-haspopup="true"
                    >
                      More
                    </button>
                    <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200 absolute left-1/2 -translate-x-1/2 top-full pt-2 z-40">
                      <div className="min-w-[220px] rounded-2xl bg-[#fcf9f4] border border-[#ebe3d5] shadow-[0_20px_50px_-20px_rgba(43,30,26,0.35)] p-2">
                        {categories.slice(4).map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/category/${cat.slug}`}
                            className="block px-4 py-2.5 rounded-xl text-sm text-[#2b1e1a] hover:bg-[#2b1e1a]/5 transition-colors"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </nav>

              {/* Icons */}
              <div className="flex items-center gap-0">
                {/* Search */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#2b1e1a] hover:bg-[#2b1e1a]/5 active:scale-95 transition-[transform,background-color]"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Wishlist — hidden on smallest mobile */}
                <Link
                  href="/wishlist"
                  className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-[#2b1e1a] hover:bg-[#f0ede9] transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* Account */}
                <Link
                  href="/account"
                  className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-[#2b1e1a] hover:bg-[#f0ede9] transition-colors"
                  aria-label="My account"
                >
                  <User className="w-5 h-5" />
                </Link>

                {/* Cart */}
                <button
                  onClick={toggleCart}
                  className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#2b1e1a] hover:bg-[#f0ede9] transition-colors"
                  aria-label={`Shopping cart, ${count} item${count !== 1 ? "s" : ""}`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {count > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#5c1d24] text-white text-[9px] font-semibold flex items-center justify-center rounded-full">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Secondary nav row (tablet condensed) */}
        <div className="hidden md:flex lg:hidden border-b border-[#ebe3d5] overflow-x-auto scrollbar-none">
          <nav className="flex items-center px-6 gap-0 min-w-max" aria-label="Category navigation">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="px-4 py-2.5 text-[13px] font-medium text-[#534343] hover:text-[#2b1e1a] whitespace-nowrap hover:bg-[#f0ede9] transition-colors"
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
            "absolute inset-0 bg-[#2b1e1a]/70 backdrop-blur-[2px] transition-opacity duration-300",
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={closeMobileMenu}
        />

        {/* Panel */}
        <nav
          className={cn(
            "absolute top-0 left-0 bottom-0 w-4/5 max-w-xs bg-[#fcf9f4] flex flex-col transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
          aria-label="Mobile navigation"
        >
          {/* Logo in drawer */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#ebe3d5]">
            <Logo alt={storeName} className="h-7" />
            <button
              onClick={closeMobileMenu}
              className="w-10 h-10 flex items-center justify-center text-[#534343] hover:bg-[#f0ede9] transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Categories */}
          <div className="flex-1 overflow-y-auto py-2">
            <p className="px-6 py-3 text-xs font-medium text-[#867273]">
              Shop by Category
            </p>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                onClick={closeMobileMenu}
                className="flex items-center px-6 py-3.5 text-sm font-medium text-[#2b1e1a] hover:bg-[#f0ede9] border-b border-[#ebe3d5] last:border-0 transition-colors min-h-[52px]"
              >
                {cat.name}
              </Link>
            ))}

            {/* Quick links */}
            <div className="mt-4 border-t border-[#ebe3d5]">
              <p className="px-6 py-3 text-xs font-medium text-[#867273]">
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
                  className="flex items-center px-6 py-3.5 text-sm font-medium text-[#534343] hover:bg-[#f0ede9] hover:text-[#2b1e1a] transition-colors min-h-[52px]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#ebe3d5]">
            <p className="text-xs text-[#867273]">© 2026 {storeName}</p>
          </div>
        </nav>
      </div>

      {/* Full-screen Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-[#fcf9f4]/95 backdrop-blur-xl flex flex-col" role="dialog" aria-label="Search">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-[#ebe3d5]"
          >
            <Search className="w-5 h-5 text-[#534343] shrink-0" />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sarees, fabrics, brocades…"
              aria-label="Search products"
              className="flex-1 bg-transparent text-base text-[#2b1e1a] placeholder:text-[#867273] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#534343] hover:bg-[#2b1e1a]/5"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-3xl w-full mx-auto">
            {!searchActive && (
              <>
                <p className="text-xs font-medium text-[#867273] mb-4">
                  Popular searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 text-xs rounded-full border border-[#c5a880] text-[#2b1e1a] hover:bg-[#f0ede9] transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </>
            )}

            {searching && <p className="text-sm text-[#867273]">Searching…</p>}

            {searchActive && !searching && results && results.items.length > 0 && (
              <ul className="divide-y divide-[#ebe3d5]">
                {results.items.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/product/${p.slug}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-4 py-3 hover:bg-[#2b1e1a]/[0.03] rounded-2xl px-2 -mx-2 transition-colors"
                    >
                      <span className="relative w-14 h-16 shrink-0 rounded-xl overflow-hidden bg-[#f0ede9]">
                        {p.images?.[0] && (
                          <Image src={p.images[0]} alt="" fill sizes="56px" className="object-cover" />
                        )}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[11px] text-[#867273]">{p.fabricType || p.department}</span>
                        <span className="block text-sm font-medium text-[#2b1e1a] truncate">{p.name}</span>
                      </span>
                      <span className="text-sm font-semibold text-[#2b1e1a] shrink-0">{formatPrice(p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {searchActive && !searching && results && results.items.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-[#2b1e1a] font-medium mb-1">No results for “{trimmed}”</p>
                <p className="text-sm text-[#867273] mb-6">Try a different word, or browse a collection.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {categories.slice(0, 4).map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="px-4 py-2 text-xs rounded-full border border-[#c5a880] text-[#2b1e1a] hover:bg-[#f0ede9]"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
