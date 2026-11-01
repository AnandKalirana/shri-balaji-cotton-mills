import { NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, orderReference, items } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const user = await getCurrentUser();
    const receipt = orderReference || `rcpt_${Date.now()}`;

    const order = await createRazorpayOrder({
      amountInINR: amount,
      receipt,
      notes: {
        userId: user?.id || "guest",
        customerEmail: user?.email || "guest@checkout.in",
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: order.keyId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}

