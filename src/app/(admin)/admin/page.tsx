"use client";
import { useState, useEffect } from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { MobileOrderCard } from "@/components/ui/MobileOrderCard";
import { StockAdjustModal } from "@/components/admin/StockAdjustModal";
import { formatPrice } from "@/lib/utils";
import {
  IndianRupee,
  ShoppingBag,
  Layers,
  AlertTriangle,
  Plus,
  Sliders,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { Order, Product } from "@/lib/types";
import { api } from "@/lib/api-client";
import { Notice } from "@/components/ui/Notice";

export default function AdminOverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, lowStockItems: 0 });
  const [demo, setDemo] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    api<{ demo: boolean; stats: typeof stats; recentOrders: Order[] }>("/api/admin/analytics").then((res) => {
      if (res.ok) {
        setOrders(res.data.recentOrders);
        setStats(res.data.stats);
        setDemo(res.data.demo);
      }
    });
    api<{ products: Product[] }>("/api/admin/products").then((res) => {
      if (res.ok) setProductsList(res.data.products);
    });
  }, []);


  return (
    <div className="space-y-6 sm:space-y-8">
      {demo && (
        <Notice tone="warning">
          You&apos;re seeing sample orders and figures because your database has no real orders yet. Real numbers appear
          here automatically once customers start ordering.
        </Notice>
      )}
      {/* 1. Mobile Quick-Action Strip (Store owner phone convenience) */}
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => productsList[0] && setSelectedProduct(productsList[0])}
          className="px-4 py-2.5 bg-[#5c1d24] text-white text-xs tracking-wider uppercase font-semibold flex items-center gap-2 whitespace-nowrap active:bg-[#2b1e1a] shrink-0 min-h-[44px]"
        >
          <Sliders className="w-4 h-4 text-[#c5a880]" />
          <span>Quick Stock Adjust</span>
        </button>

        <Link
          href="/admin/products/new"
          className="px-4 py-2.5 bg-white border border-[#c5a880] text-[#2b1e1a] text-xs tracking-wider uppercase font-semibold flex items-center gap-2 whitespace-nowrap active:bg-[#faf7f2] shrink-0 min-h-[44px]"
        >
          <Plus className="w-4 h-4 text-[#5c1d24]" />
          <span>Add New Fabric</span>
        </Link>

        <Link
          href="/admin/orders"
          className="px-4 py-2.5 bg-white border border-[#ebe3d5]/70 rounded-full text-[#534343] text-xs tracking-wider uppercase font-semibold flex items-center gap-2 whitespace-nowrap hover:border-[#c5a880] shrink-0 min-h-[44px]"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Process Orders</span>
        </Link>
      </div>

      {/* 2. Responsive KPI Metric Cards (1 col on 360px -> 2x2 on tablet -> 4 col on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Gross Revenue"
          value={formatPrice(stats.totalRevenue)}
          icon={IndianRupee}
          iconColor="text-emerald-800"
        />
        <KpiCard
          title="Total Orders"
          value={String(stats.totalOrders)}
          icon={ShoppingBag}
          iconColor="text-[#5c1d24]"
        />
        <KpiCard
          title="Catalog Pieces"
          value={String(stats.totalProducts)}
          icon={Layers}
          iconColor="text-[#725b38]"
        />
        <KpiCard
          title="Low Stock Alert"
          value={`${stats.lowStockItems} items`}
          icon={AlertTriangle}
          iconColor="text-amber-800"
        />
      </div>

      {/* 3. Recent Orders Section: Mobile Cards vs Desktop Table */}
      <div className="bg-white border border-[#ebe3d5]/70 rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(43,30,26,0.04)]">
        <div className="p-4 sm:p-6 border-b border-[#ebe3d5] flex items-center justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-playfair)] text-lg sm:text-xl font-medium text-[#2b1e1a]">
              Recent Showroom Orders
            </h2>
            <p className="text-xs text-[#867273] mt-0.5">
              Live patron orders requiring inspection and courier dispatch
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#5c1d24] hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile View: High-density touch cards (< 768px) */}
        <div className="md:hidden divide-y divide-[#ebe3d5]">
          {orders.slice(0, 5).map((order) => (
            <MobileOrderCard key={order.id} order={order} />
          ))}
        </div>

        {/* Desktop View: Controlled data table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcf9f4] text-[10px] tracking-wider uppercase font-semibold text-[#867273] border-b border-[#ebe3d5]">
              <tr>
                <th className="py-3 px-6">Order ID</th>
                <th className="py-3 px-6">Patron</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Total</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebe3d5] text-sm text-[#2b1e1a]">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-[#faf7f2] transition-colors">
                  <td className="py-4 px-6 font-semibold text-[#5c1d24]">
                    {order.orderNumber}
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium">{order.customer?.name || "Patron"}</p>
                    <p className="text-xs text-[#867273]">{order.customer?.phone}</p>
                  </td>
                  <td className="py-4 px-6 text-xs text-[#534343]">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 text-[10px] tracking-wider uppercase font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-xs font-semibold text-[#5c1d24] hover:underline"
                    >
                      Inspect →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Fabric Inventory Quick Balance Ledger */}
      <div className="bg-white border border-[#ebe3d5]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-[family-name:var(--font-playfair)] text-base sm:text-lg font-medium text-[#2b1e1a]">
              Live Loom & Fabric Balances
            </h3>
            <p className="text-xs text-[#867273]">
              Tap any fabric row to quickly adjust stock metres from your phone
            </p>
          </div>
          <Link
            href="/admin/inventory"
            className="text-xs font-semibold uppercase tracking-wider text-[#5c1d24] hover:underline"
          >
            Full Ledger →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {productsList.slice(0, 6).map((prod) => (
            <button
              key={prod.id}
              onClick={() => setSelectedProduct(prod)}
              className="p-3 text-left bg-[#fcf9f4] border border-[#ebe3d5] hover:border-[#c5a880] transition-colors flex items-center justify-between gap-3 active:bg-[#f0ede9]"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#2b1e1a] truncate">
                  {prod.name}
                </p>
                <p className="text-[11px] text-[#867273]">
                  {prod.fabricType}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-[#5c1d24]">
                  {prod.stockQty} {prod.pricePerMetre ? "metres" : "pcs"}
                </span>
                <span className="block text-[10px] text-[#867273]">Tap to adjust</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Rapid Stock Adjust Modal */}
      {selectedProduct && (
        <StockAdjustModal
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          productName={selectedProduct.name}
          productId={selectedProduct.id}
          currentStock={selectedProduct.stockQty}
          isFabric={Boolean(selectedProduct.pricePerMetre)}
          onSaved={(newVal) => {
            setProductsList((prev) =>
              prev.map((p) =>
                p.id === selectedProduct.id ? { ...p, stockQty: newVal } : p
              )
            );
          }}
        />
      )}
    </div>
  );
}

