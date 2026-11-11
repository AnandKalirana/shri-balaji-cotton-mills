import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/catalog";
import { CheckoutError, priceCart } from "@/lib/checkout";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  code: z.string().trim().min(1).max(30),
  items: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.string().min(1).nullish(),
    quantity: z.number().int().min(1).max(50),
    metres: z.number().positive().max(200).nullish(),
    isFullThaan: z.boolean().optional(),
  })).min(1).max(40),
});

/** Tells the checkout page what a coupon is worth. The real discount is worked out again when the order is placed. */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a coupon code." }, { status: 400 });
  // Stops people guessing codes.
  const limited = await rateLimit(`coupon:ip:${clientIp(req)}`, 20, 15 * 60);
  if (!limited.ok) return NextResponse.json({ error: "Too many tries. Please wait a few minutes." }, { status: 429 });
  try {
    const settings = await getStoreSettings();
    const priced = await priceCart(prisma, parsed.data.items, settings, parsed.data.code);
    return NextResponse.json({ code: priced.coupon?.code, discount: priced.discount });
  } catch (e) {
    if (e instanceof CheckoutError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[coupon]", e);
    return NextResponse.json({ error: "Couldn't check that coupon. Please try again." }, { status: 500 });
  }
}
