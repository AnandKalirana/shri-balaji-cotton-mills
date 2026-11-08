import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmOnlinePayment } from "@/lib/payment";

interface PaymentEntity {
  id?: string;
  order_id?: string;
  amount?: number;
  status?: string;
}

function signatureMatches(raw: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Razorpay tells us about payments from its own servers, so an order is confirmed even when the
 * customer closes the tab right after paying. Set it up in the Razorpay dashboard:
 * Settings > Webhooks > URL https://YOUR-DOMAIN/api/payment/webhook, events payment.captured and order.paid,
 * and put the secret you choose in RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[payment/webhook] RAZORPAY_WEBHOOK_SECRET is not set, so webhooks are refused.");
    return NextResponse.json({ error: "Webhook is not set up." }, { status: 503 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  if (!signature || !signatureMatches(raw, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: { event?: string; payload?: { payment?: { entity?: PaymentEntity } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  if (event.event !== "payment.captured" && event.event !== "order.paid") {
    return NextResponse.json({ ok: true, ignored: event.event ?? "unknown" });
  }

  const payment = event.payload?.payment?.entity;
  if (!payment?.id || !payment.order_id) return NextResponse.json({ ok: true, ignored: "no payment" });

  try {
    const order = await prisma.order.findUnique({ where: { razorpayOrderId: payment.order_id }, include: { items: true } });
    if (!order) return NextResponse.json({ ok: true, ignored: "unknown order" });

    // The amount Razorpay took must be the amount we asked for.
    if (payment.amount !== Math.round(Number(order.total) * 100)) {
      console.error(`[payment/webhook] amount mismatch on ${order.orderNumber}`);
      await prisma.order.update({
        where: { id: order.id },
        data: { cancelledReason: "Razorpay payment amount did not match the order total. Check it in the Razorpay dashboard." },
      });
      return NextResponse.json({ ok: true, flagged: true });
    }

    await confirmOnlinePayment(order, payment.id, null);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[payment/webhook]", e instanceof Error ? e.message : e);
    // A server error makes Razorpay try again later.
    return NextResponse.json({ error: "Could not process this event." }, { status: 500 });
  }
}
