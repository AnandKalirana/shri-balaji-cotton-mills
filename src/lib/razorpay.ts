import crypto from "crypto";

/** True when real Razorpay keys are set in the environment. */
export function razorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  keyId: string;
}

/** Creates an order on Razorpay (amount in rupees). Throws if keys are missing or Razorpay refuses. */
export async function createRazorpayOrder(params: {
  amountInINR: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  if (!razorpayConfigured()) throw new Error("RAZORPAY_NOT_CONFIGURED");
  const keyId = process.env.RAZORPAY_KEY_ID!;
  const auth = Buffer.from(`${keyId}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: Math.round(params.amountInINR * 100),
      currency: "INR",
      receipt: params.receipt,
      notes: params.notes ?? {},
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.description || "Razorpay could not create the order");
  }
  const data = await res.json();
  return { id: data.id, amount: data.amount, currency: data.currency, keyId };
}

/** Checks the HMAC-SHA256 signature Razorpay sends after a successful payment. */
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !orderId || !paymentId || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
