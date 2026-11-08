import type { Order, OrderItem } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CheckoutError, reserveStock, type PricedLine } from "@/lib/checkout";

export type ConfirmResult =
  | { kind: "paid"; orderNumber: string }
  /** The money arrived but the order could not be completed (closed, or stock ran out). It is flagged for a refund. */
  | { kind: "refund"; orderNumber: string };

/**
 * Marks an online order as paid. Called from the customer's browser (/api/payment/verify) and from
 * Razorpay's own server (/api/payment/webhook), so a customer who closes the tab still gets their order.
 * Safe to call twice for the same payment.
 */
export async function confirmOnlinePayment(
  order: Order & { items: OrderItem[] },
  paymentId: string,
  signature: string | null
): Promise<ConfirmResult> {
  // Already confirmed: succeed without doing anything twice.
  if (order.paymentStatus === "PAID") return { kind: "paid", orderNumber: order.orderNumber };

  if (order.orderStatus === "PENDING_PAYMENT") {
    await prisma.order.update({
      where: { id: order.id },
      data: { orderStatus: "CONFIRMED", paymentStatus: "PAID", razorpayPaymentId: paymentId, razorpaySignature: signature },
    });
    return { kind: "paid", orderNumber: order.orderNumber };
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
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
        },
      });
    });
    return { kind: "paid", orderNumber: order.orderNumber };
  } catch (e) {
    if (!(e instanceof CheckoutError)) throw e;
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        cancelledReason: expired
          ? "Paid after the order expired and an item sold out. Refund this payment."
          : "Paid on an order that was already cancelled. Refund this payment.",
      },
    });
    return { kind: "refund", orderNumber: order.orderNumber };
  }
}
