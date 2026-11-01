"use client";
import { useState } from "react";
import { products as fallbackProducts } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Plus, Edit2, Sliders, Check } from "lucide-react";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const [productsList, setProductsList] = useState<Product[]>(fallbackProducts);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const startEditPrice = (product: Product) => {
    setEditingPriceId(product.id);
    setTempPrice(product.price);
  };

  const savePrice = (productId: string) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price: tempPrice } : p))
    );
    setEditingPriceId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ebe3d5]">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-[#2b1e1a]">
            Showroom Product Catalog ({productsList.length})
          </h2>
          <p className="text-xs text-[#867273]">
            Manage Banarasi weaves, fabric yardage, prices, and inventory
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-4 py-2.5 bg-[#5c1d24] text-white text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 hover:bg-[#2b1e1a] min-h-[44px]"
        >
          <Plus className="w-4 h-4 text-[#c5a880]" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Mobile Card Feed (< 768px) */}
      <div className="md:hidden space-y-3">
        {productsList.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-[#ebe3d5]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-4 flex gap-4 items-start"
          >
            {/* Thumbnail */}
            <div className="relative w-20 h-24 shrink-0 bg-[#f6f3ee] border border-[#ebe3d5]">
              <Image
                src={
                  product.images?.[0] ||
                  "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800"
                }
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Info & Price Edit */}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] tracking-wider uppercase font-semibold text-[#867273]">
                {product.department}
              </span>
              <h4 className="font-semibold text-sm text-[#2b1e1a] truncate mt-0.5">
                {product.name}
              </h4>

              {/* Inline Mobile Price Editor */}
              <div className="mt-2 flex items-center gap-2">
                {editingPriceId === product.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(Number(e.target.value))}
                      className="w-24 px-2 py-1 text-xs border border-[#5c1d24] bg-white focus:outline-none"
                    />
                    <button
                      onClick={() => savePrice(product.id)}
                      className="p-1 bg-[#5c1d24] text-white"
                      aria-label="Save price"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#5c1d24]">
                      {formatPrice(product.price)}
                    </span>
                    <button
                      onClick={() => startEditPrice(product)}
                      className="text-[#867273] hover:text-[#2b1e1a] p-1"
                      aria-label="Edit price"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-[#534343]">
                <span>Stock: <strong>{product.stockQty}</strong></span>
                <span className={`text-[10px] uppercase font-bold ${product.inStock ? "text-emerald-700" : "text-[#ba1a1a]"}`}>
                  {product.inStock ? "Active" : "Archived"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table (>= 768px) */}
      <div className="hidden md:block bg-white border border-[#ebe3d5]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#fcf9f4] text-[10px] tracking-wider uppercase font-semibold text-[#867273] border-b border-[#ebe3d5]">
            <tr>
              <th className="py-3 px-6">Product</th>
              <th className="py-3 px-6">Category</th>
              <th className="py-3 px-6">Fabric / Specs</th>
              <th className="py-3 px-6">Price</th>
              <th className="py-3 px-6">Stock</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebe3d5] text-sm text-[#2b1e1a]">
            {productsList.map((product) => (
              <tr key={product.id} className="hover:bg-[#faf7f2] transition-colors">
                <td className="py-4 px-6 flex items-center gap-3">
                  <div className="relative w-12 h-14 shrink-0 bg-[#f6f3ee] border border-[#ebe3d5]">
                    <Image
                      src={
                        product.images?.[0] ||
                        "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800"
                      }
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <span className="text-xs text-[#867273]">ID: {product.id}</span>
                  </div>
                </td>

                <td className="py-4 px-6 text-xs text-[#534343]">
                  {product.department}
                </td>

                <td className="py-4 px-6 text-xs text-[#534343]">
                  {product.fabricType} ({product.composition})
                </td>

                <td className="py-4 px-6 font-semibold">
                  {editingPriceId === product.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(Number(e.target.value))}
                        className="w-24 px-2 py-1 text-xs border border-[#5c1d24]"
                      />
                      <button
                        onClick={() => savePrice(product.id)}
                        className="p-1 bg-[#5c1d24] text-white"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{formatPrice(product.price)}</span>
                      <button
                        onClick={() => startEditPrice(product)}
                        className="text-[#867273] hover:text-[#2b1e1a]"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </td>

                <td className="py-4 px-6">
                  <span className="font-semibold text-emerald-800">
                    {product.stockQty} {product.pricePerMetre ? "metres" : "units"}
                  </span>
                </td>

                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => startEditPrice(product)}
                    className="text-xs font-semibold text-[#5c1d24] hover:underline"
                  >
                    Edit Price
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

