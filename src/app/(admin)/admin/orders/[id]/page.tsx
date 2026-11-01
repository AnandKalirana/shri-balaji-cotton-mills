"use client";
import { useState, use } from "react";
import Link from "next/link";
import { orders as fallbackOrders } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Truck,
  Check,
  Package,
} from "lucide-react";

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const initialOrder = fallbackOrders.find((o) => o.id === orderId) || fallbackOrders[0];

  const [order, setOrder] = useState(initialOrder);
  const [status, setStatus] = useState(order.status);
  const [courier, setCourier] = useState("BlueDart Express");
  const [tracking, setTracking] = useState("BLUEDART-IN-889922");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: status,
          courierPartner: courier,
          trackingNumber: tracking,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#ebe3d5]">
        <Link
          href="/admin/orders"
          className="w-10 h-10 flex items-center justify-center text-[#534343] hover:bg-[#f0ede9] border border-[#ebe3d5]"
          aria-label="Back to orders"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-[#2b1e1a]">
              {order.orderNumber}
            </h2>
            <StatusBadge status={status} />
          </div>
          <p className="text-xs text-[#867273]">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column (Items & Pricing) */}
        <div className="md:col-span-7 space-y-6">
          {/* Items card */}
          <div className="bg-white border border-[#ebe3d5]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-5 sm:p-6">
            <h3 className="text-xs tracking-[0.14em] uppercase font-semibold text-[#5c1d24] mb-4 pb-2 border-b border-[#ebe3d5]">
              Fabric & Textile Items ({order.items.length})
            </h3>

            <div className="divide-y divide-[#ebe3d5]">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex justify-between gap-4 text-xs">
                  <div>
                    <p className="font-semibold text-sm text-[#2b1e1a]">
                      {item.product.name}
                    </p>
                    <p className="text-[#867273] mt-0.5">
                      {item.metres
                        ? `Precision Cut: ${item.metres} metres`
                        : `Quantity: ${item.quantity}`}
                    </p>
                    <p className="text-[11px] text-[#534343]">
                      Type: {item.product.fabricType}
                    </p>
                  </div>
                  <span className="font-bold text-sm text-[#2b1e1a] shrink-0">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-4 mt-4 border-t border-[#ebe3d5] flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#867273]">
                Total Paid / Collectible
              </span>
              <span className="text-xl font-bold text-[#5c1d24]">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white border border-[#ebe3d5]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-5 sm:p-6 space-y-3">
            <h3 className="text-xs tracking-[0.14em] uppercase font-semibold text-[#5c1d24] pb-2 border-b border-[#ebe3d5]">
              Patron & Delivery Information
            </h3>

            <p className="text-sm font-semibold text-[#2b1e1a]">
              {order.customer?.name}
            </p>

            <div className="space-y-2 text-xs text-[#534343]">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#867273]" />
                <a
                  href={`tel:${order.customer?.phone}`}
                  className="hover:text-[#5c1d24] font-medium"
                >
                  {order.customer?.phone} (Tap to Call)
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#867273]" />
                <a
                  href={`mailto:${order.customer?.email}`}
                  className="hover:text-[#5c1d24]"
                >
                  {order.customer?.email}
                </a>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-[#867273] shrink-0 mt-0.5" />
                <span>
                  {order.shippingAddress?.street}, {order.shippingAddress?.city},{" "}
                  {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Dispatch & Courier Control) */}
        <div className="md:col-span-5 space-y-6">
          <form
            onSubmit={handleUpdate}
            className="bg-white border border-[#ebe3d5]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-5 sm:p-6 space-y-4"
          >
            <h3 className="text-xs tracking-[0.14em] uppercase font-semibold text-[#5c1d24] pb-2 border-b border-[#ebe3d5]">
              Fulfillment Controls
            </h3>

            <div>
              <label className="block text-[11px] tracking-[0.14em] uppercase font-semibold text-[#534343] mb-1">
                Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#fcf9f4] border border-[#c5a880] p-3 text-sm text-[#2b1e1a] focus:outline-none"
              >
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing & Loom Packaging</option>
                <option value="shipped">Dispatched / In Transit</option>
                <option value="delivered">Delivered to Patron</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <Input
              label="Courier Partner"
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              placeholder="e.g. BlueDart Express, Delhivery"
            />

            <Input
              label="Waybill / Tracking No."
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="e.g. BLUEDART-12345"
            />

            <Button
              type="submit"
              loading={saving}
              fullWidth
              size="md"
              className="mt-4 min-h-[48px]"
            >
              {saved ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Fulfillment Updated</span>
                </span>
              ) : (
                <span>Update Order Status</span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

