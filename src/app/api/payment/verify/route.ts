import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { CheckoutError, reserveStock, type PricedLine } from "@/lib/checkout";

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

    // Already confirmed (for example the customer's page retried): succeed without doing anything twice.
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ success: true, orderNumber: order.orderNumber });
    }

    if (order.orderStatus === "PENDING_PAYMENT") {
      await prisma.order.update({
        where: { id: order.id },
        data: { orderStatus: "CONFIRMED", paymentStatus: "PAID", razorpayPaymentId: rzPayment, razorpaySignature: rzSig },
      });
      return NextResponse.json({ success: true, orderNumber: order.orderNumber });
    }

    // Only an order that expired unpaid can be revived. A cancelled or otherwise closed order is just flagged for refund.
    const expired = order.orderStatus === "CANCELLED" && order.cancelledReason === "Payment was not completed in time";
    try {
      if (!expired) throw new CheckoutError("closed");
      await prisma.$transaction(async (tx) => {
        const lines: PricedLine[] = order.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          productName: i.productName,
          sku: i.sku,
          unitPrice: Number(i.unitPrice),
          quantity: i.quantity,
          metres: i.metres == null ? null : Number(i.metres),
          isFullThaan: i.isFullThaan,
          lineTotal: Number(i.lineTotal),
        }));
        await reserveStock(tx, lines, order.orderNumber, order.userId);
        await tx.order.update({
          where: { id: order.id },
          data: {
            orderStatus: "CONFIRMED",
            paymentStatus: "PAID",
            cancelledReason: null,
            razorpayPaymentId: rzPayment,
            razorpaySignature: rzSig,
          },
        });
      });
      return NextResponse.json({ success: true, orderNumber: order.orderNumber });
    } catch (e) {
      if (!(e instanceof CheckoutError)) throw e;
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          razorpayPaymentId: rzPayment,
          razorpaySignature: rzSig,
          cancelledReason: expired
            ? "Paid after the order expired and an item sold out. Refund this payment."
            : "Paid on an order that was already cancelled. Refund this payment.",
        },
      });
      return NextResponse.json(
        { error: `Your payment went through, but this order could not be completed. We will refund you. Order ${order.orderNumber}.` },
        { status: 409 }
      );
    }
  } catch (e) {
    console.error("[payment/verify]", e);
    return NextResponse.json(
      { error: "Your payment was received but we couldn't update the order. Please contact the store with your payment id." },
      { status: 500 }
    );
  }
}
