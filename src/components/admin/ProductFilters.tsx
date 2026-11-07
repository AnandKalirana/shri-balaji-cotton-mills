"use client";
import { Search, X } from "lucide-react";
import { categories } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export interface ProductFilterState {
  q: string;
  category: string; // "" = all
  status: string; // "" = all
  type: string; // "" = all, "fabric", "garment"
}

export const EMPTY_FILTERS: ProductFilterState = { q: "", category: "", status: "", type: "" };

export const LOW_STOCK_AT = 5;

/** Applies the search box, category, stock/visibility and type filters to a product list. */
export function filterProducts(list: Product[], f: ProductFilterState): Product[] {
  const tokens = f.q.toLowerCase().split(/\s+/).filter(Boolean);
  return list.filter((p) => {
    if (f.category && p.category !== f.category) return false;
    if (f.type === "fabric" && !p.pricePerMetre) return false;
    if (f.type === "garment" && p.pricePerMetre) return false;
    if (f.status === "visible" && p.isActive === false) return false;
    if (f.status === "hidden" && p.isActive !== false) return false;
    if (f.status === "out" && p.stockQty > 0) return false;
    if (f.status === "low" && !(p.stockQty > 0 && p.stockQty <= LOW_STOCK_AT)) return false;
    if (f.status === "ok" && p.stockQty <= LOW_STOCK_AT) return false;
    if (tokens.length) {
      const hay = [p.name, p.slug, p.department, p.fabricType, p.composition].join(" ").toLowerCase();
      if (!tokens.every((t) => hay.includes(t))) return false;
    }
    return true;
  });
}

const STATUS_OPTIONS: Record<"products" | "inventory", { value: string; label: string }[]> = {
  products: [
    { value: "", label: "All products" },
    { value: "visible", label: "Visible on store" },
    { value: "hidden", label: "Hidden from store" },
    { value: "low", label: "Low stock" },
    { value: "out", label: "Out of stock" },
  ],
  inventory: [
    { value: "", label: "All stock levels" },
    { value: "low", label: "Low stock" },
    { value: "out", label: "Out of stock" },
    { value: "ok", label: "Well stocked" },
  ],
};

const field =
  "h-10 rounded-lg border border-black/10 bg-white px-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-colors";

export function ProductFilters({
  products,
  shown,
  value,
  onChange,
  mode,
  showType = false,
}: {
  products: Product[];
  shown: number;
  value: ProductFilterState;
  onChange: (next: ProductFilterState) => void;
  mode: "products" | "inventory";
  showType?: boolean;
}) {
  const set = (patch: Partial<ProductFilterState>) => onChange({ ...value, ...patch });
  const active = Object.values(value).some(Boolean);
  const countOf = (slug: string) => products.filter((p) => p.category === slug).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6f6f6f]" />
          <input
            type="search"
            value={value.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Search by name, design number or fabric"
            aria-label="Search products"
            className={cn(field, "w-full pl-9")}
          />
        </div>
        <select value={value.status} onChange={(e) => set({ status: e.target.value })} aria-label="Filter by status" className={field}>
          {STATUS_OPTIONS[mode].map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {showType && (
          <select value={value.type} onChange={(e) => set({ type: e.target.value })} aria-label="Filter by type" className={field}>
            <option value="">Fabric and garments</option>
            <option value="fabric">Fabric by the metre</option>
            <option value="garment">Garments</option>
          </select>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1" role="group" aria-label="Filter by category">
        {[{ slug: "", name: "All", count: products.length }, ...categories.map((c) => ({ slug: c.slug, name: c.name, count: countOf(c.slug) }))].map(
          (c) => {
            const on = value.category === c.slug;
            return (
              <button
                key={c.slug || "all"}
                type="button"
                onClick={() => set({ category: c.slug })}
                aria-pressed={on}
                className={cn(
                  "shrink-0 h-9 px-3.5 rounded-full text-sm border transition-colors whitespace-nowrap",
                  on ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "bg-white text-[#444444] border-black/10 hover:border-[#1a1a1a]"
                )}
              >
                {c.name} <span className={cn("tabular-nums text-xs", on ? "text-white/70" : "text-[#6f6f6f]")}>{c.count}</span>
              </button>
            );
          }
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-[#6f6f6f]">
        <span>
          Showing {shown} of {products.length}
        </span>
        {active && (
          <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="inline-flex items-center gap-1 font-medium text-[#1a1a1a] hover:underline">
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
