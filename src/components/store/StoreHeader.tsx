"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingBag, Menu, X, User } from "lucide-react";
import { useCartStore, useUIStore } from "@/store";
import { categories } from "@/lib/data";
import { cn } from "@/lib/utils";

export function StoreHeader() {
  const [scrolled, setScrolled] = useState(false);
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

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#5c1d24] text-white text-center py-2 px-4 text-[11px] tracking-[0.12em] uppercase font-semibold">
        Free shipping on orders above ₹2,000 · Use code ATELIER10 for 10% off
      </div>

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-30 bg-[#fcf9f4] transition-shadow duration-300",
          scrolled && "shadow-sm"
        )}
      >
        <div className="border-b border-[#ebe3d5]">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex items-center justify-between h-16 md:h-20">

              {/* Mobile: Hamburger */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden w-10 h-10 flex items-center justify-center text-[#2b1e1a] hover:bg-[#f0ede9] transition-colors"
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
                <span className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-medium text-[#2b1e1a] whitespace-nowrap tracking-tight">
                  Shri Balaji Cotton Mills
                </span>
              </Link>

              {/* Desktop: Category Nav */}
              <nav className="hidden lg:flex items-center gap-0 flex-1 justify-center" aria-label="Main navigation">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="px-4 py-2 text-[11px] tracking-[0.12em] uppercase font-semibold text-[#534343] hover:text-[#2b1e1a] hover:bg-[#f0ede9] transition-colors whitespace-nowrap"
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>

              {/* Icons */}
              <div className="flex items-center gap-0">
                {/* Search */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-10 h-10 flex items-center justify-center text-[#2b1e1a] hover:bg-[#f0ede9] transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Wishlist — hidden on smallest mobile */}
                <Link
                  href="/wishlist"
                  className="hidden sm:flex w-10 h-10 items-center justify-center text-[#2b1e1a] hover:bg-[#f0ede9] transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* Account */}
                <Link
                  href="/account"
                  className="hidden sm:flex w-10 h-10 items-center justify-center text-[#2b1e1a] hover:bg-[#f0ede9] transition-colors"
                  aria-label="My account"
                >
                  <User className="w-5 h-5" />
                </Link>

                {/* Cart */}
                <button
                  onClick={toggleCart}
                  className="relative w-10 h-10 flex items-center justify-center text-[#2b1e1a] hover:bg-[#f0ede9] transition-colors"
                  aria-label={`Shopping cart, ${count} item${count !== 1 ? "s" : ""}`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {count > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#5c1d24] text-white text-[9px] font-bold flex items-center justify-center rounded-full">
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
                className="px-4 py-2.5 text-[10px] tracking-[0.12em] uppercase font-semibold text-[#534343] hover:text-[#2b1e1a] whitespace-nowrap hover:bg-[#f0ede9] transition-colors"
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
            <span className="font-[family-name:var(--font-playfair)] text-lg font-medium text-[#2b1e1a]">
              Shri Balaji Cotton Mills
            </span>
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
            <p className="px-6 py-3 text-[10px] tracking-[0.14em] uppercase font-semibold text-[#867273]">
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
              <p className="px-6 py-3 text-[10px] tracking-[0.14em] uppercase font-semibold text-[#867273]">
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
            <p className="text-xs text-[#867273]">© 2026 Shri Balaji Cotton Mills</p>
          </div>
        </nav>
      </div>

      {/* Full-screen Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-[#fcf9f4] flex flex-col">
          <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-[#ebe3d5]">
            <Search className="w-5 h-5 text-[#534343] shrink-0" />
            <input
              autoFocus
              type="search"
              placeholder="Search fabrics, sarees, brocades…"
              className="flex-1 bg-transparent text-base text-[#2b1e1a] placeholder:text-[#867273] focus:outline-none"
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="w-10 h-10 flex items-center justify-center text-[#534343] hover:bg-[#f0ede9]"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            <p className="text-[11px] tracking-[0.14em] uppercase font-semibold text-[#867273] mb-4">
              Popular Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {["Banarasi Silk", "Kantha Cotton", "Bridal Lehenga", "Zari Dupatta", "Handloom"].map((term) => (
                <button
                  key={term}
                  className="px-4 py-2 text-xs border border-[#c5a880] text-[#2b1e1a] hover:bg-[#f0ede9] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

