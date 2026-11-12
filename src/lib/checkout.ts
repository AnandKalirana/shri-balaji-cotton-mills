import type { Prisma, PrismaClient } from "@prisma/client";
import { couponDiscount, findUsableCoupon } from "@/lib/coupons";

export type Db = PrismaClient | Prisma.TransactionClient;

export interface CartLineInput {
  productId: string;
  /** The chosen size and colour, for products that have them. */
  variantId?: string | null;
  quantity: number;
  metres?: number | null;
  isFullThaan?: boolean;
}

export interface PricedLine {
  productId: string;
  variantId: string | null;
  productName: string;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  metres: number | null;
  isFullThaan: boolean;
  lineTotal: number;
}

export interface ShopRules {
  freeShippingThreshold: number;
  standardShippingFee: number;
  enableCod: boolean;
  codMaxOrderLimit: number;
}

export class CheckoutError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

/** Prices the cart from the database. The browser's prices are never trusted. */
export async function priceCart(db: Db, lines: CartLineInput[], rules: ShopRules, couponCode?: string | null) {
  if (!lines.length) throw new CheckoutError("Your cart is empty.");
  const priced: PricedLine[] = [];

  for (const line of lines) {
    const qty = Math.floor(line.quantity);
    if (!Number.isFinite(qty) || qty < 1 || qty > 50) throw new CheckoutError("Invalid quantity in your cart.");

    const product = await db.product.findUnique({
      where: { id: line.productId },
      include: { fabricDetail: true, variants: { where: { isActive: true }, orderBy: { createdAt: "asc" } } },
    });
    if (!product || !product.isActive) {
      throw new CheckoutError("An item in your cart is no longer available. Please remove it and try again.", 409);
    }

    if (product.fabricDetail) {
      // Fabric is sold on WhatsApp only. This stays a hard stop here, so no stale page can slip an order through.
      throw new CheckoutError(`${product.name} is a fabric. Fabric is ordered on WhatsApp, please remove it from your bag.`, 409);
    }
    {
      const hasChoices = product.variants.some((v) => v.size || v.colorName);
      let variant;
      if (line.variantId) {
        variant = product.variants.find((v) => v.id === line.variantId);
        if (!variant) {
          throw new CheckoutError(`${product.name}: that size or colour is no longer available. Please choose again.`, 409);
        }
        if (variant.stockQty < qty) {
          const label = [variant.colorName, variant.size].filter(Boolean).join(", ");
          throw new CheckoutError(
            variant.stockQty > 0
              ? `${product.name} (${label}): only ${variant.stockQty} left in stock.`
              : `${product.name} (${label}) is out of stock.`,
            409
          );
        }
      } else if (hasChoices) {
        throw new CheckoutError(`${product.name}: please choose a size and colour.`, 400);
      } else {
        variant = product.variants.find((v) => v.stockQty >= qty);
        if (!variant) throw new CheckoutError(`${product.name} doesn't have ${qty} in stock.`, 409);
      }
      const unit = Math.round(Number(product.salePrice ?? product.basePrice) + Number(variant.priceAdjustment));
      const choice = [variant.colorName, variant.size].filter(Boolean).join(", ");
      priced.push({
        productId: product.id,
        variantId: variant.id,
        productName: choice ? `${product.name} (${choice})` : product.name,
        sku: variant.sku,
        unitPrice: unit,
        quantity: qty,
        metres: null,
        isFullThaan: false,
        lineTotal: unit * qty,
      });
    }
  }

  const subtotal = priced.reduce((s, l) => s + l.lineTotal, 0);
  const shippingFee = subtotal >= rules.freeShippingThreshold ? 0 : rules.standardShippingFee;
  let discount = 0;
  let coupon: { id: string; code: string } | null = null;
  if (couponCode && couponCode.trim()) {
    const c = await findUsableCoupon(db, couponCode, subtotal);
    discount = couponDiscount(c, subtotal);
    coupon = { id: c.id, code: c.code };
  }
  const payable = subtotal - discount;
  const total = payable + shippingFee;
  const gstIncluded = Math.round(payable - payable / 1.05); // prices include 5% GST
  return { lines: priced, subtotal, discount, coupon, shippingFee, total, gstIncluded };
}

/** Takes stock for each line. Fails (and the surrounding transaction rolls back) if any item has run out. */
export async function reserveStock(tx: Prisma.TransactionClient, lines: PricedLine[], orderNumber: string, userId?: string | null) {
  for (const l of lines) {
    if (l.metres != null) {
      const need = l.metres * l.quantity;
      const done = await tx.fabricDetail.updateMany({
        where: { productId: l.productId, totalMetresInStock: { gte: need } },
        data: {
          totalMetresInStock: { decrement: need },
          cutMetresAvailable: { decrement: l.isFullThaan ? 0 : need },
        },
      });
      if (done.count === 0) throw new CheckoutError(`${l.productName} just went out of stock.`, 409);
      const after = await tx.fabricDetail.findUnique({ where: { productId: l.productId } });
      if (l.isFullThaan && after) {
        await tx.fabricDetail.update({
          where: { productId: l.productId },
          data: { intactThaansCount: Math.max(0, after.intactThaansCount - l.quantity) },
        });
      }
      await tx.inventoryLog.create({
        data: {
          productId: l.productId,
          action: "PURCHASE_DEDUCTION",
          quantityChanged: -need,
          balanceAfter: Number(after?.totalMetresInStock ?? 0),
          reason: `Customer order ${orderNumber}`,
          referenceOrderId: orderNumber,
          performedById: userId ?? null,
        },
      });
    } else if (l.variantId) {
      const done = await tx.productVariant.updateMany({
        where: { id: l.variantId, stockQty: { gte: l.quantity } },
        data: { stockQty: { decrement: l.quantity } },
      });
      if (done.count === 0) throw new CheckoutError(`${l.productName} just went out of stock.`, 409);
      const after = await tx.productVariant.findUnique({ where: { id: l.variantId } });
      await tx.inventoryLog.create({
        data: {
          productId: l.productId,
          variantId: l.variantId,
          action: "PURCHASE_DEDUCTION",
          quantityChanged: -l.quantity,
          balanceAfter: after?.stockQty ?? 0,
          reason: `Customer order ${orderNumber}`,
          referenceOrderId: orderNumber,
          performedById: userId ?? null,
        },
      });
    }
  }
}

/** Gives stock back for an order's items (cancelled or never-paid orders). */
export async function restockOrder(tx: Prisma.TransactionClient, orderId: string, orderNumber: string) {
  const o = await tx.order.findUnique({ where: { id: orderId }, select: { couponCode: true } });
  if (o?.couponCode) await tx.coupon.updateMany({ where: { code: o.couponCode, usageCount: { gt: 0 } }, data: { usageCount: { decrement: 1 } } });
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const it of items) {
    if (it.metres != null) {
      const back = Number(it.metres) * it.quantity;
      const row = await tx.fabricDetail.update({
        where: { productId: it.productId },
        data: {
          totalMetresInStock: { increment: back },
          ...(it.isFullThaan ? {} : { cutMetresAvailable: { increment: back } }),
        },
      });
      await tx.inventoryLog.create({
        data: {
          productId: it.productId,
          action: "ORDER_CANCEL_RESTOCK",
          quantityChanged: back,
          balanceAfter: Number(row.totalMetresInStock),
          reason: `Order ${orderNumber} was cancelled`,
          referenceOrderId: orderNumber,
        },
      });
    } else if (it.variantId) {
      const row = await tx.productVariant.update({
        where: { id: it.variantId },
        data: { stockQty: { increment: it.quantity } },
      });
      await tx.inventoryLog.create({
        data: {
          productId: it.productId,
          variantId: it.variantId,
          action: "ORDER_CANCEL_RESTOCK",
          quantityChanged: it.quantity,
          balanceAfter: row.stockQty,
          reason: `Order ${orderNumber} was cancelled`,
          referenceOrderId: orderNumber,
        },
      });
    }
  }
}

/** Online orders that were never paid within 30 minutes give their stock back. Runs on each new checkout. */
export async function releaseExpiredOrders(db: PrismaClient) {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000);
  const stale = await db.order.findMany({
    where: { orderStatus: "PENDING_PAYMENT", createdAt: { lt: cutoff } },
    select: { id: true, orderNumber: true },
    take: 50,
  });
  for (const o of stale) {
    await db.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id: o.id, orderStatus: "PENDING_PAYMENT" },
        data: { orderStatus: "CANCELLED", cancelledReason: "Payment was not completed in time" },
      });
      if (claimed.count) await restockOrder(tx, o.id, o.orderNumber);
    });
  }
}
