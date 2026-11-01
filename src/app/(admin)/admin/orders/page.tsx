"use client";
import { useState, useEffect } from "react";
import { orders as fallbackOrders } from "@/lib/data";
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
  const [orders, setOrders] = useState<Order[]>(fallbackOrders);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/orders?status=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch(() => {});
  }, [filter]);

  const handleQuickStatusChange = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: nextStatus }),
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus as Order["status"] } : o))
      );
    } catch {
      // Fallback
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-[#2b1e1a]">
            Showroom orders ({filteredOrders.length})
          </h2>
          <p className="text-xs text-[#867273]">
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
            className="bg-white border border-[#ebe3d5]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-[#5c1d24] tracking-wider block">
                  {order.orderNumber}
                </span>
                <p className="text-sm font-semibold text-[#2b1e1a] mt-0.5">
                  {order.customer?.name || "Patron"}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            {/* Customer Details */}
            <div className="text-xs text-[#534343] space-y-1 bg-[#fcf9f4] p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#867273]" />
                <a href={`tel:${order.customer?.phone}`} className="hover:underline">
                  {order.customer?.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#867273]" />
                <span>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}
                </span>
              </div>
            </div>

            {/* Items Summary & Quick Status Switcher */}
            <div className="flex items-center justify-between pt-3 border-t border-[#ebe3d5]/70">
              <div>
                <span className="text-xs text-[#867273]">Total: </span>
                <span className="text-sm font-bold text-[#2b1e1a]">
                  {formatPrice(order.total)}
                </span>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-1.5">
                {order.status === "confirmed" && (
                  <button
                    disabled={updatingId === order.id}
                    onClick={() => handleQuickStatusChange(order.id, "processing")}
                    className="px-4 py-2 rounded-full text-xs bg-[#f0ede9] text-[#2b1e1a] font-semibold hover:bg-[#5c1d24] hover:text-white active:scale-95 transition-all disabled:opacity-50"
                  >
                    Pack
                  </button>
                )}
                {order.status === "processing" && (
                  <button
                    disabled={updatingId === order.id}
                    onClick={() => handleQuickStatusChange(order.id, "shipped")}
                    className="px-4 py-2 rounded-full text-xs bg-[#5c1d24] text-white font-semibold hover:bg-[#2b1e1a] active:scale-95 transition-all disabled:opacity-50"
                  >
                    Ship
                  </button>
                )}
                {order.status === "shipped" && (
                  <button
                    disabled={updatingId === order.id}
                    onClick={() => handleQuickStatusChange(order.id, "delivered")}
                    className="px-4 py-2 rounded-full text-xs bg-emerald-800 text-white font-semibold hover:bg-emerald-900 active:scale-95 transition-all disabled:opacity-50"
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
      <div className="hidden md:block bg-white border border-[#ebe3d5]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#fcf9f4] text-xs font-medium text-[#867273] border-b border-[#ebe3d5]/70">
            <tr>
              <th className="py-3.5 px-6">Order</th>
              <th className="py-3.5 px-6">Customer</th>
              <th className="py-3.5 px-6">Destination</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">Amount</th>
              <th className="py-3.5 px-6 text-right">Update status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebe3d5]/70 text-sm text-[#2b1e1a]">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-[#faf7f2] transition-colors">
                <td className="py-5 px-6 font-semibold text-[#5c1d24]">
                  {order.orderNumber}
                </td>
                <td className="py-5 px-6">
                  <p className="font-medium">{order.customer?.name || "Patron"}</p>
                  <p className="text-xs text-[#867273]">{order.customer?.email}</p>
                </td>
                <td className="py-5 px-6 text-xs text-[#534343]">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}
                </td>
                <td className="py-5 px-6">
                  <StatusBadge status={order.status} />
                </td>
                <td className="py-5 px-6 font-bold">
                  {formatPrice(order.total)}
                </td>
                <td className="py-5 px-6 text-right space-x-2">
                  <StatusMenu
                    ariaLabel={`Update status for ${order.orderNumber}`}
                    value={order.status}
                    options={statusOptions}
                    disabled={updatingId === order.id}
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

