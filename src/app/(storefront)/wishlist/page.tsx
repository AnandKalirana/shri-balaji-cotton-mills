"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { ProductCard } from "@/components/store/ProductCard";
import type { Product } from "@/lib/types";

export default function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids);
  const [all, setAll] = useState<Product[] | null>(null);

  // false on the server render, true in the browser, so saved items never cause a hydration mismatch
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setAll(d.products ?? []))
      .catch(() => setAll([]));
  }, []);

  const ready = mounted && all !== null;
  const saved = ready ? all!.filter((p) => ids.includes(p.id)) : [];

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 w-full">
      <span className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#5c1d24]">
        Saved for Later
      </span>
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl text-[#2b1e1a] mt-1 mb-10 border-b border-[#ebe3d5] pb-6">
        Your Wishlist
      </h1>

      {ready && saved.length === 0 ? (
        <div className="flex flex-col items-center text-center py-20">
          <span className="w-24 h-24 rounded-full bg-[#f0ede9] flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-[#c5a880]" />
          </span>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2b1e1a] mb-2">Nothing saved yet</h2>
          <p className="text-[#534343] mb-8 max-w-sm">Tap the heart on any fabric to keep it here for later.</p>
          <Link
            href="/category/fabrics"
            className="px-8 py-3.5 rounded-full bg-[#5c1d24] text-white text-xs tracking-[0.14em] uppercase font-semibold hover:bg-[#2b1e1a] transition-colors"
          >
            Browse Fabrics
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {saved.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
