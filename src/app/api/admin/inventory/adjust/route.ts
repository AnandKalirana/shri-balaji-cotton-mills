import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, auditUserId, dbErrorResponse } from "@/lib/admin-guard";
import { logAdmin } from "@/lib/admin-log";
import { revalidateStore } from "@/lib/revalidate";

const schema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  newBalance: z.number().min(0, "Stock can't be negative."),
  reason: z.string().trim().max(200).optional(),
});

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { productId, variantId, newBalance, reason } = parsed.data;
  const performedById = await auditUserId(guard.user);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: { fabricDetail: true, variants: { where: { isActive: true }, orderBy: { createdAt: "asc" } } },
      });
      if (!product) return { error: "This product isn't in the database yet. Import the sample catalogue first." };

      let before: number;
      let usedVariantId: string | null = null;

      if (product.fabricDetail) {
        before = Number(product.fabricDetail.totalMetresInStock);
        await tx.fabricDetail.update({
          where: { productId },
          data: { totalMetresInStock: newBalance, cutMetresAvailable: newBalance },
        });
      } else {
        const variant = (variantId && product.variants.find((v) => v.id === variantId)) || product.variants[0];
        if (!variant) return { error: "This product has no stock record to adjust." };
        before = variant.stockQty;
        usedVariantId = variant.id;
        await tx.productVariant.update({ where: { id: variant.id }, data: { stockQty: Math.round(newBalance) } });
      }

      const delta = newBalance - before;
      await tx.inventoryLog.create({
        data: {
          productId,
          variantId: usedVariantId,
          action: delta >= 0 ? "NEW_STOCK_RECEIPT" : /damage/i.test(reason ?? "") ? "DAMAGE_WRITE_OFF" : "MANUAL_ADJUSTMENT",
          quantityChanged: delta,
          balanceAfter: newBalance,
          reason: reason || "Manual stock adjustment",
          performedById,
        },
      });
      return { before };
    });

    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 404 });
    revalidateStore();
    await logAdmin(guard.user, "stock.adjust", "Stock was adjusted");
    return NextResponse.json({ success: true, newBalance });
  } catch (error) {
    return dbErrorResponse(error);
  }
}
