import { prisma } from "./prisma";

export interface FabricLineCalculation {
  pricePerMetre: number;
  metres: number;
  isFullThaan: boolean;
  thaanMetres: number;
  thaanDiscountPct: number;
  subtotal: number;
  discount: number;
  finalPrice: number;
}

/**
 * Accurately calculate fabric pricing for custom cuts vs intact rolls (thaans)
 */
export function calculateFabricPrice(params: {
  pricePerMetre: number;
  metres: number;
  isFullThaan?: boolean;
  standardThaanMetres?: number;
  thaanDiscountPct?: number;
}): FabricLineCalculation {
  const {
    pricePerMetre,
    metres,
    isFullThaan = false,
    standardThaanMetres = 25.0,
    thaanDiscountPct = 12.0,
  } = params;

  const actualMetres = isFullThaan ? standardThaanMetres : metres;
  const rawSubtotal = actualMetres * pricePerMetre;
  const discountAmount = isFullThaan ? (rawSubtotal * thaanDiscountPct) / 100 : 0;
  const finalPrice = Math.round(rawSubtotal - discountAmount);

  return {
    pricePerMetre,
    metres: actualMetres,
    isFullThaan,
    thaanMetres: standardThaanMetres,
    thaanDiscountPct,
    subtotal: rawSubtotal,
    discount: discountAmount,
    finalPrice,
  };
}

/**
 * Deduct inventory atomically with overselling guards and audit trail
 */
export async function deductInventoryAtomic(
  items: Array<{
    productId: string;
    variantId?: string | null;
    quantity: number;
    metres?: number | null;
    isFullThaan?: boolean;
  }>,
  orderNumber: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        // 1. Handle Fabric by Metre
        if (item.metres && item.metres > 0) {
          const fabric = await tx.fabricDetail.findUnique({
            where: { productId: item.productId },
          });

          if (!fabric) {
            throw new Error(`Fabric configuration not found for product ${item.productId}`);
          }

          const metresToDeduct = Number(item.metres);
          const currentTotal = Number(fabric.totalMetresInStock);

          if (currentTotal < metresToDeduct) {
            throw new Error(
              `Insufficient fabric stock. Requested ${metresToDeduct}m, but only ${currentTotal}m available.`
            );
          }

          const newTotal = currentTotal - metresToDeduct;
          const thaansDeducted = item.isFullThaan ? 1 : 0;
          const newThaans = Math.max(0, fabric.intactThaansCount - thaansDeducted);

          await tx.fabricDetail.update({
            where: { productId: item.productId },
            data: {
              totalMetresInStock: newTotal,
              intactThaansCount: newThaans,
              cutMetresAvailable: Math.max(0, Number(fabric.cutMetresAvailable) - (item.isFullThaan ? 0 : metresToDeduct)),
            },
          });

          // Write to Inventory Audit Ledger
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              action: "PURCHASE_DEDUCTION",
              quantityChanged: -metresToDeduct,
              balanceAfter: newTotal,
              reason: `Customer Order: ${orderNumber} (${item.isFullThaan ? "Full Thaan" : `${metresToDeduct}m cut`})`,
              referenceOrderId: orderNumber,
              performedById: userId || null,
            },
          });
        }
        // 2. Handle SKU Product Variants
        else if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          });

          if (!variant) {
            throw new Error(`Product variant ${item.variantId} not found`);
          }

          if (variant.stockQty < item.quantity) {
            throw new Error(
              `Insufficient stock for ${variant.sku}. Requested ${item.quantity}, only ${variant.stockQty} remaining.`
            );
          }

          const newQty = variant.stockQty - item.quantity;
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQty: newQty },
          });

          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              action: "PURCHASE_DEDUCTION",
              quantityChanged: -item.quantity,
              balanceAfter: newQty,
              reason: `Customer Order: ${orderNumber} (SKU: ${variant.sku})`,
              referenceOrderId: orderNumber,
              performedById: userId || null,
            },
          });
        }
      }
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reserve inventory" };
  }
}

