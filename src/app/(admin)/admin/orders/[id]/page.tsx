"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import type { Order } from "@/lib/types";
import { api } from "@/lib/api-client";
import { Notice } from "@/components/ui/Notice";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { whatsappUrl } from "@/lib/whatsapp";
import {
  ArrowLeft,
  MessageCircle,
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
  const [order, setOrder] = useState<Order | null>(null);
  const [demo, setDemo] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState("confirmed");
  const [courier, setCourier] = useState("");
  const [tracking, setTracking] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ order: Order; courier: string; tracking: string; demo: boolean }>(`/api/admin/orders/${orderId}`).then((res) => {
      if (res.ok) {
        setOrder(res.data.order);
        setStatus(res.data.order.status);
        setCourier(res.data.courier);
        setTracking(res.data.tracking);
        setDemo(res.data.demo);
      } else {
        setLoadError(res.error);
      }
    });
  }, [orderId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setError("");
    setSaved(false);
    setSaving(true);
    const res = await api(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      json: { orderStatus: status, courierPartner: courier, trackingNumber: tracking },
    });
    setSaving(false);
    if (res.ok) {
      setOrder({ ...order, status: status as Order["status"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setError(res.error);
    }
  };

  if (loadError) return <Notice tone="error">{loadError}</Notice>;
  if (!order) return <div className="py-24 text-center text-sm text-[#6f6f6f]">Loading…</div>;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#e5e5e3]">
        <Link
          href="/admin/orders"
          className="w-10 h-10 flex items-center justify-center text-[#444444] hover:bg-[#f5f5f3] border border-[#e5e5e3]"
          aria-label="Back to orders"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-[#1a1a1a]">
              {order.orderNumber}
            </h2>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-[#6f6f6f]">
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
          <div className="bg-white border border-[#e5e5e3]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-5 sm:p-6">
            <h3 className="text-xs font-medium text-[#5c1d24] mb-4 pb-2 border-b border-[#e5e5e3]">
              Fabric & Textile Items ({order.items.length})
            </h3>

            <div className="divide-y divide-[#e5e5e3]">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex justify-between gap-4 text-xs">
                  <div>
                    <p className="font-semibold text-sm text-[#1a1a1a]">
                      {item.product.name}
                    </p>
                    <p className="text-[#6f6f6f] mt-0.5">
                      {item.metres
                        ? `Precision Cut: ${item.metres} metres`
                        : `Quantity: ${item.quantity}`}
                    </p>
                    <p className="text-[11px] text-[#444444]">
                      Type: {item.product.fabricType}
                    </p>
                  </div>
                  <span className="font-semibold text-sm text-[#1a1a1a] shrink-0">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-4 mt-4 border-t border-[#e5e5e3] flex justify-between items-baseline">
              <span className="text-xs font-medium text-[#6f6f6f]">
                Total Paid / Collectible
              </span>
              <span className="text-xl font-semibold text-[#5c1d24]">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white border border-[#e5e5e3]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-5 sm:p-6 space-y-3">
            <h3 className="text-xs font-medium text-[#5c1d24] pb-2 border-b border-[#e5e5e3]">
              Patron & Delivery Information
            </h3>

            <p className="text-sm font-semibold text-[#1a1a1a]">
              {order.customer?.name}
            </p>

            <div className="space-y-2 text-xs text-[#444444]">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#6f6f6f]" />
                <a
                  href={`tel:${order.customer?.phone}`}
                  className="hover:text-[#5c1d24] font-medium"
                >
                  {order.customer?.phone} (Tap to Call)
                </a>
              </div>

              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#6f6f6f]" />
                <a
                  href={whatsappUrl(order.customer?.phone ?? "", `Hi ${order.customer?.name?.split(" ")[0] ?? ""}, this is Shri Balaji Cotton Mills about your order ${order.orderNumber ?? ""}. `)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#5c1d24] font-medium"
                >
                  Message on WhatsApp
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#6f6f6f]" />
                <a
                  href={`mailto:${order.customer?.email}`}
                  className="hover:text-[#5c1d24]"
                >
                  {order.customer?.email}
                </a>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-[#6f6f6f] shrink-0 mt-0.5" />
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
            className="bg-white border border-[#e5e5e3]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-5 sm:p-6 space-y-4"
          >
            <h3 className="text-xs font-medium text-[#5c1d24] pb-2 border-b border-[#e5e5e3]">
              Fulfillment Controls
            </h3>

            <div>
              <label className="block text-xs font-medium text-[#444444] mb-1">
                Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#f7f7f5] border border-[#c5a880] p-3 text-sm text-[#1a1a1a] focus:outline-none"
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

            {error && <Notice tone="error">{error}</Notice>}
            {demo && <Notice tone="warning">Sample order — changes can&apos;t be saved.</Notice>}

            <Button
              type="submit"
              disabled={demo}
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

