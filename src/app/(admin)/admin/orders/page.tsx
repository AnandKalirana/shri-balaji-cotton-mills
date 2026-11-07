"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Notice } from "@/components/ui/Notice";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StatusMenu } from "@/components/ui/StatusMenu";
import { Phone, MapPin } from "lucide-react";
import type { Order } from "@/lib/types";

const filterOptions = [
  { value: "all", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ orders: Order[]; demo: boolean }>(`/api/admin/orders?status=${filter}`).then((res) => {
      if (res.ok) {
        setOrders(res.data.orders);
        setDemo(res.data.demo);
      } else {
        setError(res.error);
      }
      setLoading(false);
    });
  }, [filter]);

  const handleQuickStatusChange = async (orderId: string, nextStatus: string) => {
    setError("");
    setUpdatingId(orderId);
    const res = await api(`/api/admin/orders/${orderId}`, { method: "PATCH", json: { orderStatus: nextStatus } });
    setUpdatingId(null);
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus as Order["status"] } : o)));
    } else {
      setError(res.error);
    }
  };

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <div className="py-24 text-center text-sm text-[#6f6f6f]">Loading…</div>;

  return (
    <div className="space-y-6">
      {demo && (
        <Notice tone="warning">
          These are sample orders. Real customer orders will appear here automatically, and status changes can only be
          saved on real orders.
        </Notice>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-[#1a1a1a]">
            Showroom orders ({filteredOrders.length})
          </h2>
          <p className="text-xs text-[#6f6f6f]">
            Track fulfilment, courier dispatches and deliveries
          </p>
        </div>

        {/* Filter */}
        <SegmentedControl
          ariaLabel="Filter orders by status"
          options={filterOptions}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {/* Mobile Card Feed (< 768px) */}
      <div className="md:hidden space-y-3">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-[#e5e5e3]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-[#5c1d24] tracking-wider block">
                  {order.orderNumber}
                </span>
                <p className="text-sm font-semibold text-[#1a1a1a] mt-0.5">
                  {order.customer?.name || "Patron"}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            {/* Customer Details */}
            <div className="text-xs text-[#444444] space-y-1 bg-[#f7f7f5] p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#6f6f6f]" />
                <a href={`tel:${order.customer?.phone}`} className="hover:underline">
                  {order.customer?.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#6f6f6f]" />
                <span>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}
                </span>
              </div>
            </div>

            {/* Items Summary & Quick Status Switcher */}
            <div className="flex items-center justify-between pt-3 border-t border-[#e5e5e3]/70">
              <div>
                <span className="text-xs text-[#6f6f6f]">Total: </span>
                <span className="text-sm font-semibold text-[#1a1a1a]">
                  {formatPrice(order.total)}
                </span>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-1.5">
                {order.status === "confirmed" && (
                  <button
                    disabled={demo || updatingId === order.id}
                    onClick={() => handleQuickStatusChange(order.id, "processing")}
                    className="px-4 py-2 rounded-full text-xs bg-[#f5f5f3] text-[#1a1a1a] font-semibold hover:bg-[#5c1d24] hover:text-white active:scale-95 transition-[transform,background-color] disabled:opacity-50"
                  >
                    Pack
                  </button>
                )}
                {order.status === "processing" && (
                  <button
                    disabled={demo || updatingId === order.id}
                    onClick={() => handleQuickStatusChange(order.id, "shipped")}
                    className="px-4 py-2 rounded-full text-xs bg-[#5c1d24] text-white font-semibold hover:bg-[#1a1a1a] active:scale-95 transition-[transform,background-color] disabled:opacity-50"
                  >
                    Ship
                  </button>
                )}
                {order.status === "shipped" && (
                  <button
                    disabled={demo || updatingId === order.id}
                    onClick={() => handleQuickStatusChange(order.id, "delivered")}
                    className="px-4 py-2 rounded-full text-xs bg-emerald-800 text-white font-semibold hover:bg-emerald-900 active:scale-95 transition-[transform,background-color] disabled:opacity-50"
                  >
                    Deliver
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Data Table (>= 768px) */}
      <div className="hidden md:block bg-white border border-[#e5e5e3]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f7f7f5] text-xs font-medium text-[#6f6f6f] border-b border-[#e5e5e3]/70">
            <tr>
              <th className="py-3.5 px-6">Order</th>
              <th className="py-3.5 px-6">Customer</th>
              <th className="py-3.5 px-6">Destination</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">Amount</th>
              <th className="py-3.5 px-6 text-right">Update status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5e3]/70 text-sm text-[#1a1a1a]">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-[#f7f7f5] transition-colors">
                <td className="py-5 px-6 font-semibold text-[#5c1d24]">
                  {order.orderNumber}
                </td>
                <td className="py-5 px-6">
                  <p className="font-medium">{order.customer?.name || "Patron"}</p>
                  <p className="text-xs text-[#6f6f6f]">{order.customer?.email}</p>
                </td>
                <td className="py-5 px-6 text-xs text-[#444444]">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}
                </td>
                <td className="py-5 px-6">
                  <StatusBadge status={order.status} />
                </td>
                <td className="py-5 px-6 font-semibold">
                  {formatPrice(order.total)}
                </td>
                <td className="py-5 px-6 text-right space-x-2">
                  <StatusMenu
                    ariaLabel={`Update status for ${order.orderNumber}`}
                    value={order.status}
                    options={statusOptions}
                    disabled={demo || updatingId === order.id}
                    onChange={(next) => handleQuickStatusChange(order.id, next)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

