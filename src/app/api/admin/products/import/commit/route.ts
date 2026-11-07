import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, auditUserId, dbErrorResponse } from "@/lib/admin-guard";
import { ensureCategory, uniqueSlug } from "@/lib/seed-catalog";
import { copyRemoteImage } from "@/lib/store-image";
import { revalidateStore } from "@/lib/revalidate";

const rowSchema = z.object({
  line: z.number().int(),
  designNo: z.string().max(40),
  name: z.string().trim().min(2).max(140),
  mrp: z.number().positive().optional(),
  price: z.number().positive(),
  description: z.string().trim().min(1).max(4000),
  images: z.array(z.string().url()).min(1).max(6),
  category: z.string().min(1),
  stock: z.number().int().min(0).max(100000),
  badge: z.string().max(30).optional().default(""),
});

// Photos are downloaded one product at a time, so the screen sends a few products per request.
const bodySchema = z.object({ rows: z.array(rowSchema).min(1).max(5) });

type Result = { line: number; name: string; status: "created" | "skipped" | "failed"; message: string; slug?: string };

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Those rows couldn't be read. Check the file and try again." }, { status: 400 });

  const performedById = await auditUserId(guard.user);
  const results: Result[] = [];

  for (const d of parsed.data.rows) {
    const base = { line: d.line, name: d.name };
    try {
      const sku = d.designNo ? `SBCM-${d.designNo}`.toUpperCase().slice(0, 40) : null;
      if (sku && (await prisma.productVariant.findUnique({ where: { sku }, select: { id: true } }))) {
        results.push({ ...base, status: "skipped", message: "Already in your store." });
        continue;
      }
      const category = await ensureCategory(prisma, d.category);
      if (!category) {
        results.push({ ...base, status: "failed", message: "That category doesn't exist." });
        continue;
      }

      // Copy every photo into our own storage first, so nothing depends on the old site.
      const stored: string[] = [];
      let photoError = "";
      for (const url of d.images) {
        try {
          stored.push(await copyRemoteImage(url));
        } catch (e) {
          photoError = e instanceof Error ? e.message : "A photo couldn't be copied.";
          if (!stored.length) break;
        }
      }
      if (!stored.length) {
        results.push({ ...base, status: "failed", message: photoError || "No photo could be copied." });
        continue;
      }

      const slug = await uniqueSlug(prisma, d.name);
      const hasDiscount = d.mrp !== undefined && d.mrp > d.price;
      const product = await prisma.product.create({
        data: {
          name: d.name,
          slug,
          description: d.description,
          type: "STANDARD_PRODUCT",
          categoryId: category.id,
          basePrice: hasDiscount ? d.mrp! : d.price,
          salePrice: hasDiscount ? d.price : null,
          images: stored,
          badge: d.badge || null,
          isActive: true,
          variants: { create: { sku: sku ?? `SBCM-${slug}`.toUpperCase().slice(0, 40), stockQty: d.stock } },
        },
      });

      if (d.stock > 0) {
        await prisma.inventoryLog
          .create({
            data: {
              productId: product.id,
              action: "NEW_STOCK_RECEIPT",
              quantityChanged: d.stock,
              balanceAfter: d.stock,
              reason: "Opening stock from bulk import",
              performedById,
            },
          })
          .catch(() => undefined);
      }
      results.push({
        ...base,
        status: "created",
        slug,
        message: photoError ? `Added. One extra photo was skipped: ${photoError}` : "Added.",
      });
    } catch (error) {
      if (error instanceof Error && /unreachable|P1001|P1000|P2021|P2022|does not exist/i.test(error.message)) return dbErrorResponse(error);
      results.push({ ...base, status: "failed", message: "Couldn't save this product." });
    }
  }

  if (results.some((r) => r.status === "created")) revalidateStore();
  return NextResponse.json({ results });
}
