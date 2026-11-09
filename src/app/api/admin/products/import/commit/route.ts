import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwner, auditUserId, dbErrorResponse } from "@/lib/admin-guard";
import { logAdmin } from "@/lib/admin-log";
import { ensureCategory, uniqueSlug } from "@/lib/seed-catalog";
import { copyRemoteImage } from "@/lib/store-image";
import { revalidateStore } from "@/lib/revalidate";
import { colourHex } from "@/lib/colours";
import { combos, variantSku } from "@/lib/variants";

/** True for a photo already in our own Supabase storage (uploaded on the import screen): no need to download it again. */
function isOwnStorageUrl(url: string): boolean {
  try {
    const own = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : null;
    return Boolean(own) && new URL(url).hostname === own;
  } catch {
    return false;
  }
}

const rowSchema = z.object({
  line: z.number().int(),
  designNo: z.string().max(40),
  code: z.string().max(80).optional().default(""),
  name: z.string().trim().min(2).max(140),
  mrp: z.number().positive().optional(),
  price: z.number().positive(),
  description: z.string().trim().min(1).max(4000),
  images: z.array(z.string().url()).min(1).max(6),
  category: z.string().min(1),
  sizes: z.array(z.string().trim().min(1).max(20)).max(12).optional().default([]),
  colours: z.array(z.string().trim().min(1).max(40)).max(20).optional().default([]),
  stock: z.number().int().min(0).max(100000),
  badge: z.string().max(30).optional().default(""),
});

// Photos are downloaded one product at a time, so the screen sends a few products per request.
const bodySchema = z.object({ rows: z.array(rowSchema).min(1).max(5) });

type Result = { line: number; name: string; status: "created" | "skipped" | "failed"; message: string; slug?: string };

export async function POST(req: Request) {
  const guard = await requireOwner();
  if (guard.error) return guard.error;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Those rows couldn't be read. Check the file and try again." }, { status: 400 });

  const performedById = await auditUserId(guard.user);
  const results: Result[] = [];

  for (const d of parsed.data.rows) {
    const base = { line: d.line, name: d.name };
    try {
      const isFabric = d.category === "fabrics";
      const designBase = d.code ? variantSku(d.code, "", "") : null;
      const list = combos(d.colours, d.sizes);
      const hasChoices = !isFabric && (d.colours.length > 0 || d.sizes.length > 0);
      if (isFabric) {
        // Fabric has no size or colour variants, so an existing one is found by its name.
        const same = await prisma.product.findFirst({ where: { name: d.name, category: { slug: "fabrics" } }, select: { id: true } });
        if (same) {
          results.push({ ...base, status: "skipped", message: "Already in your store." });
          continue;
        }
      } else if (designBase) {
        const found = await prisma.productVariant.findMany({
          where: { OR: [{ sku: designBase }, { sku: { startsWith: `${designBase}-` } }] },
          select: { id: true, sku: true, size: true, colorName: true, productId: true },
        });
        if (found.length) {
          // A product imported before sizes and colours existed has one plain variant.
          // Importing the same file again turns it into the full set of sizes and colours.
          const legacy = found.length === 1 && !found[0].size && !found[0].colorName && found[0].sku === designBase;
          if (legacy && hasChoices) {
            const first = list[0];
            await prisma.$transaction(async (tx) => {
              await tx.productVariant.update({
                where: { id: found[0].id },
                data: {
                  sku: variantSku(d.code, first.colour, first.size),
                  colorName: first.colour || null,
                  colorHex: first.colour ? colourHex(first.colour) ?? null : null,
                  size: first.size || null,
                },
              });
              for (const c of list.slice(1)) {
                await tx.productVariant.create({
                  data: {
                    productId: found[0].productId,
                    sku: variantSku(d.code, c.colour, c.size),
                    colorName: c.colour || null,
                    colorHex: c.colour ? colourHex(c.colour) ?? null : null,
                    size: c.size || null,
                    stockQty: d.stock,
                  },
                });
              }
            });
            results.push({ ...base, status: "created", message: `Updated with ${list.length} size and colour options.` });
            continue;
          }
          results.push({ ...base, status: "skipped", message: "Already in your store." });
          continue;
        }
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
          stored.push(isOwnStorageUrl(url) ? url : await copyRemoteImage(url));
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
          type: isFabric ? "FABRIC_BY_METRE" : "STANDARD_PRODUCT",
          categoryId: category.id,
          basePrice: isFabric ? d.price : hasDiscount ? d.mrp! : d.price,
          salePrice: !isFabric && hasDiscount ? d.price : null,
          images: stored,
          badge: d.badge || null,
          isActive: true,
          ...(isFabric
            ? { fabricDetail: { create: { widthInches: 44, pricePerMetre: d.price, totalMetresInStock: d.stock, cutMetresAvailable: d.stock } } }
            : {
          variants: {
            create: hasChoices
              ? list.map((c) => ({
                  sku: variantSku(d.code || slug, c.colour, c.size),
                  colorName: c.colour || null,
                  colorHex: c.colour ? colourHex(c.colour) ?? null : null,
                  size: c.size || null,
                  stockQty: d.stock,
                }))
              : { sku: designBase ?? `SBCM-${slug}`.toUpperCase().slice(0, 40), stockQty: d.stock },
          },
            }),
        },
      });

      if (d.stock > 0) {
        const total = d.stock * (hasChoices ? list.length : 1); // fabric: stock is in metres
        await prisma.inventoryLog
          .create({
            data: {
              productId: product.id,
              action: "NEW_STOCK_RECEIPT",
              quantityChanged: total,
              balanceAfter: total,
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

  if (results.some((r) => r.status === "created")) {
    revalidateStore();
    await logAdmin(guard.user, "product.import", `${results.filter((r) => r.status === "created").length} products imported`);
  }
  return NextResponse.json({ results });
}
