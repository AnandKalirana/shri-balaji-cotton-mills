import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { confirmOnlinePayment } from "@/lib/payment";

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

/** Confirms an online payment. Only a signature made with the Razorpay secret is accepted. */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payment details." }, { status: 400 });
  const { razorpay_order_id: rzOrder, razorpay_payment_id: rzPayment, razorpay_signature: rzSig } = parsed.data;

  if (!verifyRazorpaySignature(rzOrder, rzPayment, rzSig)) {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({ where: { razorpayOrderId: rzOrder }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const result = await confirmOnlinePayment(order, rzPayment, rzSig);
    if (result.kind === "paid") return NextResponse.json({ success: true, orderNumber: result.orderNumber });
    return NextResponse.json(
      { error: `Your payment went through, but this order could not be completed. We will refund you. Order ${result.orderNumber}.` },
      { status: 409 }
    );
  } catch (e) {
    console.error("[payment/verify]", e);
    return NextResponse.json(
      { error: "Your payment was received but we couldn't update the order. Please contact the store with your payment id." },
      { status: 500 }
    );
  }
}
