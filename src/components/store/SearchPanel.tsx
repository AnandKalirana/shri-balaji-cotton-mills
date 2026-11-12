"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, X } from "lucide-react";
import { categories } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

const COMMON_SEARCHES = ["Cotton Fabric", "Kurta Set", "Kurti", "Stretchy Blouse", "Shapewear"];

const labelOf = (p: Product) => categories.find((c) => c.slug === p.category)?.name ?? p.department ?? "";
const priceOf = (p: Product) => (p.pricePerMetre ? `${formatPrice(p.pricePerMetre)} / metre` : formatPrice(p.price));

function ProductTile({ p, onPick }: { p: Product; onPick: () => void }) {
  return (
    <Link href={`/product/${p.slug}`} onClick={onPick} className="group block">
      <span className="relative block aspect-[3/4] overflow-hidden bg-mist">
        {p.images?.[0] && (
          <Image src={p.images[0]} alt="" fill sizes="(min-width: 768px) 12vw, 45vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        )}
      </span>
      <span className="block pt-3 text-[11px] uppercase tracking-wide text-graphite">{labelOf(p)}</span>
      <span className="block mt-1 text-sm font-semibold uppercase leading-snug text-ink line-clamp-2">{p.name}</span>
      <span className="block mt-1 text-xs text-graphite">{priceOf(p)}</span>
    </Link>
  );
}

/** Search that opens as a panel on the right, with common searches and suggested products. */
export function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ q: string; items: Product[] } | null>(null);
  const [suggested, setSuggested] = useState<Product[]>([]);
  const trimmed = query.trim();
  const active = trimmed.length >= 2;
  const searching = active && results?.q !== trimmed;

  // Suggested products load the first time the panel opens.
  useEffect(() => {
    if (!open || suggested.length) return;
    let cancelled = false;
    fetch("/api/products?limit=4")
      .then((r) => r.json())
      .then((d) => !cancelled && setSuggested((d.products ?? []).slice(0, 4)))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, suggested.length]);

  // Live search: waits for a pause in typing.
  useEffect(() => {
    if (!open || !active) return;
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
  }, [open, active, trimmed]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // the page behind stays put while searching
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  const close = () => {
    setQuery("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Search">
      <button type="button" aria-label="Close search" onClick={close} className="fade-in-fast absolute inset-0 hidden md:block bg-ink/55 cursor-default" />

      <div className="slide-in-right absolute inset-y-0 right-0 flex w-full flex-col bg-white md:w-[52%] lg:w-1/2">
        <div className="flex items-center gap-4 px-4 pt-6 sm:px-8 md:pt-10">
          <form onSubmit={(e) => e.preventDefault()} className="flex h-12 flex-1 items-center gap-3 rounded-full border border-wine px-4 focus-within:ring-2 focus-within:ring-wine/25">
            <Search className="h-5 w-5 shrink-0 text-graphite" />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-muted focus:outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear" className="text-graphite hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
          <button type="button" onClick={close} className="shrink-0 text-sm font-medium text-wine underline underline-offset-4">
            Cancel
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-10 pt-8 sm:px-8">
          {!active && (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-ink">Common searches</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {COMMON_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="press inline-flex h-12 items-center gap-3 border border-line px-4 text-sm text-ink hover:border-wine/50 hover:bg-mist"
                  >
                    {term}
                    <ArrowRight className="h-4 w-4 text-wine" />
                  </button>
                ))}
              </div>

              {suggested.length > 0 && (
                <>
                  <p className="mt-12 text-sm font-semibold text-ink">Are you looking for...</p>
                  <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 lg:grid-cols-4">
                    {suggested.map((p) => (
                      <ProductTile key={p.id} p={p} onPick={close} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {searching && <p className="text-sm text-muted">Searching...</p>}

          {active && !searching && results && results.items.length > 0 && (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-ink">
                {results.items.length} result{results.items.length === 1 ? "" : "s"} for &ldquo;{trimmed}&rdquo;
              </p>
              <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 lg:grid-cols-4">
                {results.items.map((p) => (
                  <ProductTile key={p.id} p={p} onPick={close} />
                ))}
              </div>
            </>
          )}

          {active && !searching && results && results.items.length === 0 && (
            <div className="py-10">
              <p className="font-medium text-ink">No results for &ldquo;{trimmed}&rdquo;</p>
              <p className="mb-6 mt-1 text-sm text-muted">Try a different word, or browse a collection.</p>
              <div className="flex flex-wrap gap-3">
                {categories.slice(0, 5).map((c) => (
                  <Link key={c.id} href={`/category/${c.slug}`} onClick={close} className="inline-flex h-12 items-center gap-3 border border-line px-4 text-sm text-ink hover:bg-mist">
                    {c.name}
                    <ArrowRight className="h-4 w-4 text-wine" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
