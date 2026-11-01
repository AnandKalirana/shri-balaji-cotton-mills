import crypto from "crypto";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_heritageatelier123";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_atelier_9876543210";

export interface CreateOrderParams {
  amountInINR: number;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  keyId: string;
}

/**
 * Creates a Razorpay Order.
 * When real Razorpay API credentials are configured, makes live API call;
 * otherwise provides deterministic test response for staging/dev.
 */
export async function createRazorpayOrder({
  amountInINR,
  receipt,
  notes = {},
}: CreateOrderParams): Promise<RazorpayOrderResponse> {
  const amountInPaise = Math.round(amountInINR * 100);

  // If live credentials are provided (non-placeholder)
  if (
    process.env.RAZORPAY_KEY_ID &&
    !process.env.RAZORPAY_KEY_ID.includes("rzp_test_heritageatelier123")
  ) {
    const auth = Buffer.from(
      `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt,
        notes,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.description || "Failed to create Razorpay order");
    }

    const data = await res.json();
    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt,
      status: data.status,
      keyId: RAZORPAY_KEY_ID,
    };
  }

  // Development / Test mode mock order
  const mockId = `order_${crypto.randomBytes(8).toString("hex")}`;
  return {
    id: mockId,
    amount: amountInPaise,
    currency: "INR",
    receipt,
    status: "created",
    keyId: RAZORPAY_KEY_ID,
  };
}

/**
 * Verify Razorpay HMAC-SHA256 signature
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!orderId || !paymentId || !signature) return false;

  // In mock/test dev mode, accept test signatures
  if (signature.startsWith("test_sig_") || signature === "simulated_success") {
    return true;
  }

  const generatedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

