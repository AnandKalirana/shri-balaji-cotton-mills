import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, auditUserId, dbErrorResponse } from "@/lib/admin-guard";
import { getProducts } from "@/lib/catalog";
import { ensureCategory, uniqueSlug } from "@/lib/seed-catalog";
import { validateImageRef } from "@/lib/images";
import { revalidateStore } from "@/lib/revalidate";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { products, demo } = await getProducts({ includeInactive: true });
  return NextResponse.json({ products, demo });
}

const createSchema = z
  .object({
    name: z.string().trim().min(2, "Product title is required.").max(140),
    category: z.string().min(1, "Choose a category."),
    price: z.number().positive("Price must be more than 0."),
    isFabric: z.boolean(),
    pricePerMetre: z.number().positive().optional(),
    widthInches: z.number().positive().optional(),
    stockQty: z.number().min(0, "Stock can't be negative."),
    composition: z.string().trim().max(200).optional().default(""),
    fabricType: z.string().trim().max(80).optional().default(""),
    description: z.string().trim().min(1, "Add a short description.").max(4000),
    badge: z.string().trim().max(30).optional().default(""),
    images: z
      .array(z.string())
      .min(1, "Add at least one product photo.")
      .max(6)
      .superRefine((list, ctx) => {
        for (const ref of list) {
          const problem = validateImageRef(ref);
          if (problem) ctx.addIssue({ code: "custom", message: problem });
        }
      }),
  })
  .refine((v) => !v.isFabric || (v.pricePerMetre ?? 0) > 0, {
    message: "Enter the price per metre for fabric sold by the metre.",
    path: ["pricePerMetre"],
  });

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const d = parsed.data;

  try {
    const category = await ensureCategory(prisma, d.category);
    if (!category) return NextResponse.json({ error: "That category doesn't exist." }, { status: 400 });

    const slug = await uniqueSlug(prisma, d.name);
    const product = await prisma.product.create({
      data: {
        name: d.name,
        slug,
        description: d.description,
        type: d.isFabric ? "FABRIC_BY_METRE" : "STANDARD_PRODUCT",
        categoryId: category.id,
        basePrice: d.price,
        images: d.images,
        badge: d.badge || null,
        weaveType: d.fabricType || null,
        composition: d.composition || null,
        isActive: true,
        ...(d.isFabric
          ? {
              fabricDetail: {
                create: {
                  widthInches: d.widthInches ?? 44,
                  pricePerMetre: d.pricePerMetre!,
                  totalMetresInStock: d.stockQty,
                  cutMetresAvailable: d.stockQty,
                },
              },
            }
          : { variants: { create: { sku: `SBCM-${slug}`.toUpperCase().slice(0, 40), stockQty: Math.round(d.stockQty) } } }),
      },
    });

    if (d.stockQty > 0) {
      await prisma.inventoryLog
        .create({
          data: {
            productId: product.id,
            action: "NEW_STOCK_RECEIPT",
            quantityChanged: d.stockQty,
            balanceAfter: d.stockQty,
            reason: "Opening stock when product was added",
            performedById: await auditUserId(guard.user),
          },
        })
        .catch(() => undefined);
    }

    revalidateStore();
    return NextResponse.json({ success: true, id: product.id, slug });
  } catch (error) {
    return dbErrorResponse(error);
  }
}
