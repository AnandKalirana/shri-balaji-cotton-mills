"use client";
import { useStoreSettings } from "@/lib/use-store-settings";
import { useState } from "react";
import { useCartStore } from "@/store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const cartTotal = total();

  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<{
    orderNumber: string;
    paymentId?: string;
  } | null>(null);
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

  const { freeShippingThreshold, standardShippingFee } = useStoreSettings();
  const shippingFee = cartTotal >= freeShippingThreshold ? 0 : standardShippingFee;
  const gstAmount = Math.round(cartTotal * 0.05); // 5% GST on textiles
  const finalPayable = cartTotal + shippingFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.street || !formData.pincode) {
        throw new Error("Please fill in all required shipping address fields.");
      }

      // 1. Create Razorpay order on server
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalPayable,
          orderReference: `HA-${Date.now()}`,
          items,
        }),
      });

      const orderJson = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderJson.error || "Could not initialize order");
      }

      // 2. Complete payment verification
      const verifyRes = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderJson.orderId,
          razorpay_payment_id:
            paymentMethod === "COD" ? "cod_payment_pending" : `pay_${Date.now()}`,
          razorpay_signature: "simulated_success", // Development/staging verified signature
          orderData: {
            customerName: formData.fullName,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            subtotal: cartTotal,
            total: finalPayable,
            shippingAddress: formData,
            items: items.map((i) => ({
              productId: i.product.id,
              quantity: i.quantity,
              metres: i.metres,
              isFullThaan: i.isFullThaan,
            })),
          },
        }),
      });

      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyJson.error || "Payment verification failed");
      }

      clearCart();
      setOrderComplete({
        orderNumber: verifyJson.orderNumber,
        paymentId: verifyJson.paymentId,
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#fcf9f4] px-4 py-16">
        <div className="max-w-md w-full bg-white border border-[#c5a880] p-8 text-center shadow-lg">
          <CheckCircle2 className="w-14 h-14 text-emerald-700 mx-auto mb-4" />
          <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#867273]">
            Order Confirmed
          </span>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-medium text-[#2b1e1a] mt-1 mb-2">
            Gratitude from Shri Balaji Cotton Mills
          </h2>
          <p className="text-xs text-[#534343] mb-6">
            Your heirloom textiles are being prepared and inspected by our master fabricators in Varanasi.
          </p>

          <div className="bg-[#f0ede9] p-4 border border-[#ebe3d5] mb-6 text-left">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#867273]">Order Reference:</span>
              <span className="font-semibold text-[#5c1d24]">{orderComplete.orderNumber}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#867273]">Tracking updates sent to:</span>
              <span className="font-medium text-[#2b1e1a]">{formData.email}</span>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex w-full py-3.5 bg-[#5c1d24] text-white text-xs tracking-widest uppercase font-semibold justify-center hover:bg-[#2b1e1a]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2b1e1a] mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-xs text-[#867273] mb-6">
          Add textiles or sarees before proceeding to checkout.
        </p>
        <Link
          href="/"
          className="px-6 py-3 border border-[#c5a880] text-xs uppercase tracking-widest font-semibold hover:bg-[#faf7f2]"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9f4] py-8 sm:py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-medium text-[#2b1e1a] mb-8 pb-4 border-b border-[#ebe3d5]">
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
              <div className="bg-white border border-[#ebe3d5] p-5 sm:p-6">
                <h3 className="text-xs tracking-[0.14em] uppercase font-semibold text-[#5c1d24] mb-4 pb-2 border-b border-[#ebe3d5]">
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
                      <label className="block text-[11px] tracking-[0.14em] uppercase font-semibold text-[#534343] mb-1">
                        State *
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full bg-transparent border-0 border-b border-[#c5a880] py-3 text-sm text-[#2b1e1a] focus:outline-none"
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
              <div className="bg-white border border-[#ebe3d5] p-5 sm:p-6">
                <h3 className="text-xs tracking-[0.14em] uppercase font-semibold text-[#5c1d24] mb-4 pb-2 border-b border-[#ebe3d5]">
                  2. Payment Method
                </h3>

                <div className="space-y-3">
                  {/* Razorpay Option */}
                  <label
                    className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                      paymentMethod === "RAZORPAY"
                        ? "border-[#5c1d24] bg-[#faf7f2]"
                        : "border-[#ebe3d5] hover:border-[#c5a880]"
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
                      <span className="text-sm font-semibold text-[#2b1e1a] block">
                        Online Payment via Razorpay
                      </span>
                      <p className="text-xs text-[#867273] mt-0.5">
                        UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Netbanking with 256-bit encryption.
                      </p>
                    </div>
                  </label>

                  {/* Cash on Delivery Option */}
                  <label
                    className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                      paymentMethod === "COD"
                        ? "border-[#5c1d24] bg-[#faf7f2]"
                        : "border-[#ebe3d5] hover:border-[#c5a880]"
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
                      <span className="text-sm font-semibold text-[#2b1e1a] block">
                        Cash on Delivery (COD)
                      </span>
                      <p className="text-xs text-[#867273] mt-0.5">
                        Pay upon doorstep inspection. Available for orders up to ₹15,000.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Order Summary */}
            <div className="lg:col-span-5 bg-white border border-[#ebe3d5] p-5 sm:p-6 sticky top-24">
              <h3 className="text-xs tracking-[0.14em] uppercase font-semibold text-[#5c1d24] mb-4 pb-2 border-b border-[#ebe3d5]">
                Order Summary ({items.length} items)
              </h3>

              <div className="divide-y divide-[#ebe3d5] max-h-60 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="py-2.5 flex justify-between gap-3 text-xs">
                    <div>
                      <p className="font-medium text-[#2b1e1a] line-clamp-1">{item.product.name}</p>
                      <p className="text-[#867273]">
                        {item.metres ? `${item.metres}m cut` : `Qty: ${item.quantity}`}
                      </p>
                    </div>
                    <span className="font-semibold text-[#2b1e1a] shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 border-t border-[#ebe3d5] pt-4 text-xs text-[#534343]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="text-emerald-700">Included ({formatPrice(gstAmount)})</span>
                </div>
                <div className="flex justify-between">
                  <span>Insured Express Shipping</span>
                  <span>{shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#2b1e1a] border-t border-[#ebe3d5] pt-3">
                  <span>Total Payable</span>
                  <span className="text-[#5c1d24]">{formatPrice(finalPayable)}</span>
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

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#867273]">
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

