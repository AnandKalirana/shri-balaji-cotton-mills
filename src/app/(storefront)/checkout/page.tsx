"use client";
import { useStoreSettings } from "@/lib/use-store-settings";
import { useState } from "react";
import { useCartStore } from "@/store";
import { formatPrice } from "@/lib/utils";
import { OrderSuccess, type OrderSummary } from "@/components/store/OrderSuccess";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Couldn't load the payment window. Check your connection and try again."));
    document.body.appendChild(s);
  });
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const cartTotal = total();

  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<OrderSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "Uttar Pradesh",
    pincode: "",
  });

  const { freeShippingThreshold, standardShippingFee, codMaxOrderLimit, enableCod } = useStoreSettings();
  const shippingFee = cartTotal >= freeShippingThreshold ? 0 : standardShippingFee;
  const gstAmount = Math.round(cartTotal * 0.05); // 5% GST on textiles
  // Coupon: the server checks the code and works out the discount; the page only shows it.
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const discount = coupon?.discount ?? 0;
  const finalPayable = cartTotal - discount + shippingFee;

  const cartLines = () =>
    items.map((i) => ({
      productId: i.product.id,
      variantId: i.variantId ?? null,
      quantity: i.quantity,
      metres: i.metres ?? null,
      isFullThaan: i.isFullThaan ?? false,
    }));

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponBusy(true);
    setCouponMsg("");
    try {
      const r = await fetch("/api/checkout/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, items: cartLines() }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setCoupon(null);
        setCouponMsg(d.error || "Couldn't check that coupon.");
      } else {
        setCoupon({ code: d.code, discount: d.discount });
      }
    } catch {
      setCouponMsg("Could not reach the server. Please try again.");
    } finally {
      setCouponBusy(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Copied from the bag before it is emptied, so the receipt can list what was ordered.
  const buildSummary = (orderNumber: string, total: number, paid: boolean): OrderSummary => ({
    orderNumber,
    email: formData.email,
    total,
    paymentLabel: paid ? "Paid online" : "Pay on delivery (Cash on Delivery)",
    placedAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    lines: items.map((i) => ({
      name: i.product.name,
      detail: i.metres ? `${i.isFullThaan ? "full thaan" : `${i.metres} m`}` : `x ${i.quantity}`,
    })),
  });

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.street || !formData.city || !formData.pincode) {
        throw new Error("Please fill in all required shipping address fields.");
      }

      // The server works out prices and totals itself; we only send what was picked.
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          couponCode: coupon?.code ?? null,
          customer: { fullName: formData.fullName, email: formData.email, phone: formData.phone },
          address: { street: formData.street, city: formData.city, state: formData.state, pincode: formData.pincode },
          items: items.map((i) => ({
            productId: i.product.id,
            variantId: i.variantId ?? null,
            quantity: i.quantity,
            metres: i.metres ?? null,
            isFullThaan: i.isFullThaan ?? false,
          })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not place your order.");

      // Cash on Delivery: the order is already confirmed.
      if (!json.razorpay) {
        setOrderComplete(buildSummary(json.orderNumber, Number(json.total ?? finalPayable), false));
        clearCart();
        return;
      }

      // Online payment: open Razorpay, then let the server verify the result.
      await loadRazorpayScript();
      await new Promise<void>((resolve, reject) => {
        const rz = new window.Razorpay({
          key: json.razorpay.keyId,
          amount: json.razorpay.amount,
          currency: "INR",
          order_id: json.razorpay.orderId,
          name: "Shri Balaji Cotton Mills",
          description: `Order ${json.orderNumber}`,
          prefill: { name: formData.fullName, email: formData.email, contact: formData.phone },
          image: `${window.location.origin}/brand/icon.png`,
          theme: { color: "#5c1d24" },
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              const v = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              });
              const vj = await v.json().catch(() => ({}));
              if (!v.ok) throw new Error(vj.error || "Payment could not be verified.");
              setOrderComplete(buildSummary(vj.orderNumber, finalPayable, true));
              clearCart();
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: { ondismiss: () => reject(new Error("Payment was not completed. You have not been charged. Please try again.")) },
        });
        rz.on("payment.failed", (r: { error?: { description?: string } }) =>
          reject(new Error(r.error?.description || "Payment failed. Please try again."))
        );
        rz.open();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred during checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) return <OrderSuccess order={orderComplete} />;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-ink mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-xs text-muted mb-6">
          Add textiles or sarees before proceeding to checkout.
        </p>
        <Link
          href="/"
          className="px-6 py-3 border border-sand text-xs font-medium hover:bg-cream"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-medium text-ink mb-8 pb-4 border-b border-line">
          Checkout & Delivery
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left 7 Columns: Shipping Address & Payment Selection */}
            <div className="lg:col-span-7 space-y-8">
              {/* Shipping Address */}
              <div className="bg-white border border-line p-5 sm:p-6">
                <h3 className="text-xs font-medium text-wine mb-4 pb-2 border-b border-line">
                  1. Shipping & Contact Information
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name *"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Maharani Devi"
                      required
                    />
                    <Input
                      label="Phone (for courier updates) *"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>

                  <Input
                    label="Email Address *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="concierge@domain.com"
                    required
                  />

                  <Input
                    label="Street Address / House No. *"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Flat/House No., Building, Street Name"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="City *"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Varanasi"
                      required
                    />

                    <div>
                      <label className="block text-xs font-medium text-graphite mb-1">
                        State *
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full bg-transparent border-0 border-b border-sand py-3 text-sm text-ink focus:outline-none"
                      >
                        {[
                          "Uttar Pradesh",
                          "Delhi",
                          "Maharashtra",
                          "Karnataka",
                          "West Bengal",
                          "Gujarat",
                          "Tamil Nadu",
                          "Telangana",
                          "Rajasthan",
                          "Kerala",
                        ].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Pincode *"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="221001"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-line p-5 sm:p-6">
                <h3 className="text-xs font-medium text-wine mb-4 pb-2 border-b border-line">
                  2. Payment Method
                </h3>

                <div className="space-y-3">
                  {/* Razorpay Option */}
                  <label
                    className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                      paymentMethod === "RAZORPAY"
                        ? "border-wine bg-cream"
                        : "border-line hover:border-sand"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "RAZORPAY"}
                      onChange={() => setPaymentMethod("RAZORPAY")}
                      className="mt-1"
                    />
                    <div>
                      <span className="text-sm font-semibold text-ink block">
                        Online Payment via Razorpay
                      </span>
                      <p className="text-xs text-muted mt-0.5">
                        UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Netbanking with 256-bit encryption.
                      </p>
                    </div>
                  </label>

                  {enableCod && (
                  <>
                  {/* Cash on Delivery Option */}
                  <label
                    className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                      paymentMethod === "COD"
                        ? "border-wine bg-cream"
                        : "border-line hover:border-sand"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="mt-1"
                    />
                    <div>
                      <span className="text-sm font-semibold text-ink block">
                        Cash on Delivery (COD)
                      </span>
                      <p className="text-xs text-muted mt-0.5">
                        Pay in cash when your order arrives. Available for orders up to {formatPrice(codMaxOrderLimit)}.
                      </p>
                    </div>
                  </label>
                  </>
                  )}
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Order Summary */}
            <div className="lg:col-span-5 bg-white border border-line p-5 sm:p-6 sticky top-24">
              <h3 className="text-xs font-medium text-wine mb-4 pb-2 border-b border-line">
                Order Summary ({items.length} items)
              </h3>

              <div className="divide-y divide-line max-h-60 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={`${item.product.id}:${item.variantId ?? ""}`} className="py-2.5 flex justify-between gap-3 text-xs">
                    <div>
                      <p className="font-medium text-ink line-clamp-1">{item.product.name}</p>
                      <p className="text-muted">
                        {item.metres
                          ? `${item.metres}m cut`
                          : `${[item.colour, item.size].filter(Boolean).join(" · ")}${item.colour || item.size ? " · " : ""}Qty: ${item.quantity}`}
                      </p>
                    </div>
                    <span className="font-semibold text-ink shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="border-t border-line pt-4 mb-4">
                {coupon ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-700">Coupon {coupon.code} applied</span>
                    <button type="button" onClick={() => { setCoupon(null); setCouponInput(""); setCouponMsg(""); }} className="font-medium text-wine underline">Remove</button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Coupon code"
                        aria-label="Coupon code"
                        className="flex-1 min-w-0 h-11 px-3 border border-line text-sm bg-white"
                      />
                      <Button type="button" variant="secondary" loading={couponBusy} onClick={applyCoupon} className="min-h-[44px]">Apply</Button>
                    </div>
                    {couponMsg && <p role="alert" className="mt-2 text-xs text-danger">{couponMsg}</p>}
                  </>
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 border-t border-line pt-4 text-xs text-graphite">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon {coupon?.code}</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="text-emerald-700">Included ({formatPrice(gstAmount)})</span>
                </div>
                <div className="flex justify-between">
                  <span>Insured Express Shipping</span>
                  <span>{shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-ink border-t border-line pt-3">
                  <span>Total Payable</span>
                  <span className="text-wine">{formatPrice(finalPayable)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                fullWidth
                size="lg"
                className="mt-6 min-h-[52px]"
              >
                <span>
                  {paymentMethod === "COD"
                    ? `Confirm COD Order • ${formatPrice(finalPayable)}`
                    : `Pay Securely • ${formatPrice(finalPayable)}`}
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Protected by Razorpay SSL 256-bit Encryption</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

