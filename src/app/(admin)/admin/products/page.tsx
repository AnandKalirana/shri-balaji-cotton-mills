"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Edit2, Check, X, Archive, RotateCcw } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { Notice } from "@/components/ui/Notice";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/lib/types";
import { ProductFilters, filterProducts, EMPTY_FILTERS, type ProductFilterState } from "@/components/admin/ProductFilters";

const FALLBACK_IMG = "/placeholder.png";
const card = "bg-white border border-[#e5e5e3]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)]";

const fetchProducts = () => api<{ products: Product[]; demo: boolean }>("/api/admin/products");

export default function AdminProductsPage() {
  const [list, setList] = useState<Product[]>([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const [filters, setFilters] = useState<ProductFilterState>(EMPTY_FILTERS);
  const shown = filterProducts(list, filters);

  const apply = useCallback((res: Awaited<ReturnType<typeof fetchProducts>>) => {
    if (res.ok) {
      setList(res.data.products);
      setDemo(res.data.demo);
    } else {
      setMessage({ tone: "error", text: res.error });
    }
    setLoading(false);
  }, []);

  const load = useCallback(() => fetchProducts().then(apply), [apply]);

  useEffect(() => {
    fetchProducts().then(apply);
  }, [apply]);

  const savePrice = async (p: Product) => {
    const price = parseFloat(tempPrice);
    if (!(price > 0)) {
      setMessage({ tone: "error", text: "Enter a price above 0." });
      return;
    }
    setBusyId(p.id);
    const res = await api(`/api/admin/products/${p.id}`, { method: "PATCH", json: { price } });
    setBusyId(null);
    if (res.ok) {
      setList((prev) => prev.map((x) => (x.id === p.id ? { ...x, price } : x)));
      setEditingId(null);
      setMessage({ tone: "success", text: `Price for “${p.name}” updated to ${formatPrice(price)}.` });
    } else {
      setMessage({ tone: "error", text: res.error });
    }
  };

  const toggleActive = async (p: Product) => {
    const makeActive = p.isActive === false;
    setBusyId(p.id);
    const res = await api(`/api/admin/products/${p.id}`, { method: "PATCH", json: { isActive: makeActive } });
    setBusyId(null);
    if (res.ok) {
      await load();
      setMessage({ tone: "success", text: makeActive ? `“${p.name}” is visible on the store again.` : `“${p.name}” is hidden from the store.` });
    } else {
      setMessage({ tone: "error", text: res.error });
    }
  };

  const importSamples = async () => {
    setImporting(true);
    const res = await api<{ created: number }>("/api/admin/products/import-sample", { method: "POST" });
    setImporting(false);
    if (res.ok) {
      await load();
      setMessage({ tone: "success", text: `${res.data.created} sample product(s) copied into your database. You can edit them now.` });
    } else {
      setMessage({ tone: "error", text: res.error });
    }
  };

  const PriceCell = ({ p }: { p: Product }) =>
    editingId === p.id ? (
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          inputMode="decimal"
          autoFocus
          value={tempPrice}
          onChange={(e) => setTempPrice(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && savePrice(p)}
          className="w-24 px-3 py-1.5 rounded-full text-sm border border-[#5c1d24] bg-white focus:outline-none"
          aria-label="New price"
        />
        <button onClick={() => savePrice(p)} disabled={busyId === p.id} className="w-8 h-8 rounded-full bg-[#5c1d24] text-white flex items-center justify-center disabled:opacity-50" aria-label="Save price">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setEditingId(null)} className="w-8 h-8 rounded-full text-[#444444] hover:bg-[#1a1a1a]/5 flex items-center justify-center" aria-label="Cancel">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <span className="font-semibold">{formatPrice(p.price)}</span>
        <button
          onClick={() => { setEditingId(p.id); setTempPrice(String(p.price)); setMessage(null); }}
          className="w-7 h-7 rounded-full flex items-center justify-center text-[#6f6f6f] hover:text-[#1a1a1a] hover:bg-[#1a1a1a]/5"
          aria-label={`Edit price of ${p.name}`}
        >
          <Edit2 className="w-3 h-3" />
        </button>
      </div>
    );

  const VisibilityButton = ({ p }: { p: Product }) => (
    <button
      onClick={() => toggleActive(p)}
      disabled={busyId === p.id || demo}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5c1d24] hover:underline disabled:opacity-40 disabled:no-underline"
    >
      {p.isActive === false ? <><RotateCcw className="w-3.5 h-3.5" />Show</> : <><Archive className="w-3.5 h-3.5" />Hide</>}
    </button>
  );

  if (loading) return <div className="py-24 text-center text-sm text-[#6f6f6f]">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-[#1a1a1a]">
            Products ({list.length})
          </h2>
          <p className="text-xs text-[#6f6f6f]">Edit prices, hide pieces from the store, or add new ones.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
        <Link href="/admin/products/import" className="text-sm font-semibold text-[#5c1d24] hover:underline">
          Import from file
        </Link>
        <Link
          href="/admin/products/new"
          className="px-5 py-2.5 rounded-full bg-[#5c1d24] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#1a1a1a] active:scale-95 transition-[transform,background-color] min-h-[44px]"
        >
          <Plus className="w-4 h-4 text-[#c5a880]" />
          <span>Add product</span>
        </Link>
        </div>
      </div>

      {demo && (
        <Notice
          tone="warning"
          action={
            <Button size="sm" loading={importing} onClick={importSamples} className="rounded-full shrink-0">
              Import sample products
            </Button>
          }
        >
          These are built-in sample products, not saved in your database, so they can&apos;t be edited yet. Import them to
          make them editable, or just add your own products.
        </Notice>
      )}
      {message && <Notice tone={message.tone}>{message.text}</Notice>}

      <ProductFilters products={list} shown={shown.length} value={filters} onChange={setFilters} mode="products" />

      {shown.length === 0 && list.length > 0 && (
        <div className={`${card} py-12 text-center text-sm text-[#6f6f6f]`}>
          No products match these filters.{" "}
          <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="font-medium text-[#1a1a1a] underline">
            Clear filters
          </button>
        </div>
      )}

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {shown.map((p) => (
          <div key={p.id} className={`${card} p-4 flex gap-4 items-start`}>
            <div className="relative w-20 h-24 shrink-0 rounded-xl overflow-hidden bg-[#f5f5f3]">
              <Image src={p.images?.[0] || FALLBACK_IMG} alt={p.name} fill sizes="80px" className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] text-[#6f6f6f]">{p.department}</span>
              <h4 className="font-semibold text-sm text-[#1a1a1a] truncate">{p.name}</h4>
              <div className="mt-2 text-sm text-[#5c1d24]"><PriceCell p={p} /></div>
              <div className="mt-2 flex items-center justify-between text-xs text-[#444444]">
                <span>Stock: <strong>{p.stockQty}</strong></span>
                <VisibilityButton p={p} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className={`hidden md:block ${card} overflow-hidden`}>
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f7f7f5] text-xs font-medium text-[#6f6f6f] border-b border-[#e5e5e3]/70">
            <tr>
              <th className="py-3.5 px-6">Product</th>
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-6">Fabric</th>
              <th className="py-3.5 px-6">Price</th>
              <th className="py-3.5 px-6">Stock</th>
              <th className="py-3.5 px-6 text-right">Store</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5e3]/70 text-[#1a1a1a]">
            {shown.map((p) => (
              <tr key={p.id} className="hover:bg-[#f7f7f5] transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-14 shrink-0 rounded-lg overflow-hidden bg-[#f5f5f3]">
                      <Image src={p.images?.[0] || FALLBACK_IMG} alt="" fill sizes="48px" className="object-cover" />
                    </div>
                    <p className="font-semibold">{p.name}</p>
                  </div>
                </td>
                <td className="py-4 px-6 text-[#444444]">{p.department}</td>
                <td className="py-4 px-6 text-[#444444]">{p.fabricType}</td>
                <td className="py-4 px-6"><PriceCell p={p} /></td>
                <td className="py-4 px-6">
                  <span className={`font-semibold ${p.stockQty <= 5 ? "text-amber-700" : "text-emerald-800"}`}>
                    {p.stockQty} {p.pricePerMetre ? "metres" : "units"}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {!p.pricePerMetre && (
                      <Link href={`/admin/products/${p.id}`} className="text-xs font-semibold text-[#5c1d24] hover:underline whitespace-nowrap">
                        {p.options?.variants.length ? `${p.options.colours.length || 0} colours, ${p.options.sizes.length || 0} sizes` : "Add sizes and colours"}
                      </Link>
                    )}
                    <VisibilityButton p={p} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
