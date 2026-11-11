import type { Coupon } from "@prisma/client";
import { CheckoutError } from "@/lib/checkout";
import type { Db } from "@/lib/checkout";

/** Looks a code up and checks every rule. Throws a plain message the customer can read. */
export async function findUsableCoupon(db: Db, rawCode: string, subtotal: number): Promise<Coupon> {
  const code = rawCode.trim().toUpperCase();
  const c = code ? await db.coupon.findUnique({ where: { code } }) : null;
  const now = new Date();
  if (!c || !c.isActive || c.validFrom > now || c.validUntil < now) throw new CheckoutError("That coupon code isn't valid.", 400);
  if (c.usageLimit != null && c.usageCount >= c.usageLimit) throw new CheckoutError("That coupon has been fully used.", 400);
  const min = Number(c.minOrderValue ?? 0);
  if (subtotal < min) throw new CheckoutError(`This coupon needs an order of at least ₹${min.toLocaleString("en-IN")}.`, 400);
  return c;
}

/** Rupees off, never more than the order itself. */
export function couponDiscount(c: Coupon, subtotal: number): number {
  let off = 0;
  if (c.discountPercent != null) off = (subtotal * Number(c.discountPercent)) / 100;
  else if (c.discountAmount != null) off = Number(c.discountAmount);
  if (c.maxDiscount != null) off = Math.min(off, Number(c.maxDiscount));
  return Math.max(0, Math.min(Math.round(off), subtotal));
}
