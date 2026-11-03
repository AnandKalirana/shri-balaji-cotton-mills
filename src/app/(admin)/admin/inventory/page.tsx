"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Notice } from "@/components/ui/Notice";
import { formatPrice } from "@/lib/utils";
import { StockAdjustModal } from "@/components/admin/StockAdjustModal";
import { Sliders, AlertTriangle, CheckCircle, Package } from "lucide-react";
import type { Product } from "@/lib/types";

export default function AdminInventoryPage() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    api<{ products: Product[]; demo: boolean }>("/api/admin/products").then((res) => {
      if (res.ok) {
        setProductsList(res.data.products);
        setDemo(res.data.demo);
      } else {
        setLoadError(res.error);
      }
      setLoading(false);
    });
  }, []);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleStockUpdated = (newStock: number) => {
    if (!selectedProduct) return;
    setProductsList((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id ? { ...p, stockQty: newStock } : p
      )
    );
  };

  if (loading) return <div className="py-24 text-center text-sm text-[#867273]">Loading…</div>;

  return (
    <div className="space-y-6">
      {demo && (
        <Notice tone="warning">
          These are built-in sample products, so stock can&apos;t be changed yet. Import them from{" "}
          <Link href="/admin/products" className="underline font-semibold">Products</Link> to make them editable.
        </Notice>
      )}
      {loadError && <Notice tone="error">{loadError}</Notice>}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ebe3d5]">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-[#2b1e1a]">
            Fabric & Metre Inventory Ledger
          </h2>
          <p className="text-xs text-[#867273]">
            Track available bolt yardage, uncut thaans, and SKU garment stock
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
            {productsList.filter((p) => p.stockQty <= 5).length} Low Stock Alert
          </span>
        </div>
      </div>

      {/* Mobile Card Feed (< 768px) */}
      <div className="md:hidden space-y-3">
        {productsList.map((product) => {
          const isFabric = Boolean(product.pricePerMetre);
          const isLow = product.stockQty <= 5;

          return (
            <div
              key={product.id}
              className={`bg-white border p-4 space-y-3 ${
                isLow ? "border-amber-300" : "border-[#ebe3d5]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] tracking-wider uppercase font-semibold text-[#867273]">
                    {product.fabricType}
                  </span>
                  <h4 className="font-semibold text-sm text-[#2b1e1a] line-clamp-1">
                    {product.name}
                  </h4>
                </div>

                {isLow ? (
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Low</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] uppercase font-semibold bg-emerald-100 text-emerald-800">
                    Optimal
                  </span>
                )}
              </div>

              {/* Specs & Balances */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-[#fcf9f4] p-3 border border-[#ebe3d5]">
                <div>
                  <span className="text-[#867273] block">Current Balance</span>
                  <span className="font-bold text-[#5c1d24] text-sm">
                    {product.stockQty} {isFabric ? "metres" : "pcs"}
                  </span>
                </div>
                <div>
                  <span className="text-[#867273] block">Valuation</span>
                  <span className="font-semibold text-[#2b1e1a]">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>

              {/* Adjust Button */}
              <button
                onClick={() => setSelectedProduct(product)}
                className="w-full py-2.5 bg-[#5c1d24] text-white text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 active:bg-[#2b1e1a] min-h-[44px]"
              >
                <Sliders className="w-4 h-4 text-[#c5a880]" />
                <span>Adjust Stock (Tap Stepper)</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Desktop Table (>= 768px) */}
      <div className="hidden md:block bg-white border border-[#ebe3d5]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#fcf9f4] text-[10px] tracking-wider uppercase font-semibold text-[#867273] border-b border-[#ebe3d5]">
            <tr>
              <th className="py-3 px-6">Product / Fabric</th>
              <th className="py-3 px-6">Category</th>
              <th className="py-3 px-6">Type</th>
              <th className="py-3 px-6">Price</th>
              <th className="py-3 px-6">Available Stock</th>
              <th className="py-3 px-6 text-right">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebe3d5] text-sm text-[#2b1e1a]">
            {productsList.map((product) => {
              const isFabric = Boolean(product.pricePerMetre);
              const isLow = product.stockQty <= 5;

              return (
                <tr key={product.id} className="hover:bg-[#faf7f2] transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-[#867273]">{product.composition}</p>
                  </td>
                  <td className="py-4 px-6 text-xs text-[#534343]">
                    {product.department}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 text-[10px] tracking-wider uppercase font-semibold bg-[#f0ede9] text-[#2b1e1a] border border-[#ebe3d5]">
                      {isFabric ? "Fabric by Metre" : "Garment SKU"}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold">
                    {formatPrice(product.price)}
                    {isFabric && (
                      <span className="block text-[11px] text-[#867273]">
                        {formatPrice(product.pricePerMetre!)}/m
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isLow ? "text-[#ba1a1a]" : "text-emerald-800"}`}>
                        {product.stockQty} {isFabric ? "metres" : "units"}
                      </span>
                      {isLow && (
                        <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold bg-amber-100 text-amber-800">
                          Low
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="px-3 py-1.5 bg-[#f0ede9] hover:bg-[#5c1d24] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors border border-[#c5a880]"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stock Adjust Modal */}
      {selectedProduct && (
        <StockAdjustModal
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          productName={selectedProduct.name}
          productId={selectedProduct.id}
          currentStock={selectedProduct.stockQty}
          isFabric={Boolean(selectedProduct.pricePerMetre)}
          onSaved={handleStockUpdated}
        />
      )}
    </div>
  );
}

