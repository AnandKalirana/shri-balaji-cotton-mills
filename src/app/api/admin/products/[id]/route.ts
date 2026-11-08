import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwner, dbErrorResponse } from "@/lib/admin-guard";
import { logAdmin } from "@/lib/admin-log";
import { revalidateStore } from "@/lib/revalidate";

const patchSchema = z.object({
  price: z.number().positive("Price must be more than 0.").optional(),
  pricePerMetre: z.number().positive("Price per metre must be more than 0.").optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireOwner();
  if (guard.error) return guard.error;

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { price, pricePerMetre, isActive } = parsed.data;

  try {
    const existing = await prisma.product.findUnique({ where: { id }, include: { fabricDetail: true } });
    if (!existing) {
      return NextResponse.json(
        { error: "This product isn't in the database yet. Import the sample catalogue first, then edit it." },
        { status: 404 }
      );
    }

    await prisma.product.update({
      where: { id },
      data: {
        ...(price !== undefined ? { basePrice: price, salePrice: null } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(pricePerMetre !== undefined && existing.fabricDetail
          ? { fabricDetail: { update: { pricePerMetre } } }
          : {}),
      },
    });
    revalidateStore();
    await logAdmin(guard.user, "product.update", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return dbErrorResponse(error);
  }
}
