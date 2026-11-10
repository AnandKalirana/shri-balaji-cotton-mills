import { NextResponse, after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getStoreSettings } from "@/lib/catalog";
import { CheckoutError, priceCart, releaseExpiredOrders, reserveStock } from "@/lib/checkout";
import { createRazorpayOrder, razorpayConfigured, RazorpayKeyError } from "@/lib/razorpay";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { notifyOrderPlaced } from "@/lib/order-emails";

const schema = z.object({
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  customer: z.object({
    fullName: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(120),
    phone: z.string().trim().regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  }),
  address: z.object({
    street: z.string().trim().min(5).max(200),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(60),
    pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1).nullish(),
        quantity: z.number().int().min(1).max(50),
        metres: z.number().positive().max(200).nullish(),
        isFullThaan: z.boolean().optional(),
      })
    )
    .min(1)
    .max(40),
});

function newOrderNumber() {
  return `SB-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
}

/**
 * Places an order. Prices, shipping and totals are calculated here from the database;
 * only the cart's product ids and quantities are taken from the browser.
 * COD orders are confirmed immediately. Online orders wait for /api/payment/verify.
 */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: issue?.message || "Please check your details and try again." }, { status: 400 });
  }
  const { paymentMethod, customer, address, items } = parsed.data;

  // Stops bots and pranksters from flooding orders (each order holds stock).
  const limited = await rateLimit(`checkout:ip:${clientIp(req)}`, 15, 60 * 60);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many orders from this connection. Please try again in a little while." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  try {
    const settings = await getStoreSettings();
    if (paymentMethod === "COD" && !settings.enableCod) {
      return NextResponse.json({ error: "Cash on Delivery isn't available right now." }, { status: 400 });
    }
    if (paymentMethod === "RAZORPAY" && !razorpayConfigured()) {
      return NextResponse.json(
        { error: "Online payment isn't available yet. Please choose Cash on Delivery or contact the store." },
        { status: 503 }
      );
    }

    await releaseExpiredOrders(prisma);

    // Per phone number: a few Cash on Delivery orders a day, and a few unpaid online orders at a time.
    const phone = customer.phone.replace(/[\s-]/g, "").replace(/^\+91/, "");
    const phoneVariants = [phone, `+91${phone}`, `+91 ${phone}`];
    if (paymentMethod === "COD") {
      const codToday = await prisma.order.count({
        where: {
          customerPhone: { in: phoneVariants },
          paymentMethod: "COD",
          orderStatus: { not: "CANCELLED" },
          createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });
      if (codToday >= 3) {
        return NextResponse.json(
          { error: "This phone number has reached today's limit for Cash on Delivery orders. Please pay online or call the store." },
          { status: 429 }
        );
      }
    } else {
      const unpaid = await prisma.order.count({ where: { customerPhone: { in: phoneVariants }, orderStatus: "PENDING_PAYMENT" } });
      if (unpaid >= 5) {
        return NextResponse.json({ error: "Please complete or wait for your earlier unpaid orders before placing another." }, { status: 429 });
      }
    }
    const user = await getCurrentUser();
    const userId = user ? (await prisma.user.findUnique({ where: { id: user.id }, select: { id: true } }))?.id ?? null : null;

    const priced = await priceCart(prisma, items, settings);
    if (paymentMethod === "COD" && priced.total > settings.codMaxOrderLimit) {
      return NextResponse.json(
        { error: `Cash on Delivery is available up to ₹${settings.codMaxOrderLimit.toLocaleString("en-IN")}. Please pay online.` },
        { status: 400 }
      );
    }

    // Create the Razorpay order first so a failure there leaves no half-made order or stock change.
    let razorpay: { id: string; keyId: string } | null = null;
    const orderNumber = newOrderNumber();
    if (paymentMethod === "RAZORPAY") {
      razorpay = await createRazorpayOrder({
        amountInINR: priced.total,
        receipt: orderNumber,
        notes: { customerEmail: customer.email },
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      await reserveStock(tx, priced.lines, orderNumber, userId);
      return tx.order.create({
        data: {
          orderNumber,
          userId,
          customerName: customer.fullName,
          customerEmail: customer.email.toLowerCase(),
          customerPhone: customer.phone,
          subtotal: priced.subtotal,
          gstTotal: priced.gstIncluded,
          shippingFee: priced.shippingFee,
          total: priced.total,
          orderStatus: paymentMethod === "COD" ? "CONFIRMED" : "PENDING_PAYMENT",
          paymentMethod,
          paymentStatus: "UNPAID",
          razorpayOrderId: razorpay?.id ?? null,
          shippingAddressSnapshot: address,
          items: {
            create: priced.lines.map((l) => ({
              productId: l.productId,
              variantId: l.variantId,
              productName: l.productName,
              sku: l.sku,
              unitPrice: l.unitPrice,
              quantity: l.quantity,
              metres: l.metres,
              isFullThaan: l.isFullThaan,
              lineTotal: l.lineTotal,
            })),
          },
        },
      });
    });

    // Cash on Delivery is confirmed now; online orders send their emails once paid.
    if (paymentMethod === "COD") after(() => notifyOrderPlaced(order.id).catch((e) => console.error("[notify]", e)));

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      total: priced.total,
      ...(razorpay ? { razorpay: { orderId: razorpay.id, keyId: razorpay.keyId, amount: Math.round(priced.total * 100) } } : {}),
    });
  } catch (e) {
    if (e instanceof CheckoutError) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e instanceof RazorpayKeyError) {
      console.error("[checkout]", e.message);
      return NextResponse.json(
        { error: "Online payment isn't working right now. Please choose Cash on Delivery or contact the store." },
        { status: 503 }
      );
    }
    console.error("[checkout]", e);
    return NextResponse.json(
      { error: "We couldn't place your order right now. Please try again in a moment." },
      { status: 500 }
    );
  }
}
