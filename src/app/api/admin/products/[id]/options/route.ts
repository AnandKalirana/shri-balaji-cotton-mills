import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwner, auditUserId, dbErrorResponse } from "@/lib/admin-guard";
import { logAdmin } from "@/lib/admin-log";
import { validateImageRef } from "@/lib/images";
import { revalidateStore } from "@/lib/revalidate";
import { colourHex } from "@/lib/colours";
import { variantSku } from "@/lib/variants";

const key = (colour: string, size: string) => `${colour.trim().toLowerCase()}||${size.trim().toLowerCase()}`;

function readColourImages(v: unknown): Record<string, string[]> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: Record<string, string[]> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (Array.isArray(val)) out[k] = val.filter((x): x is string => typeof x === "string");
  }
  return out;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireOwner();
  if (guard.error) return guard.error;
  const { id } = await params;
  try {
    const p = await prisma.product.findUnique({
      where: { id },
      include: { variants: { where: { isActive: true }, orderBy: { createdAt: "asc" } }, fabricDetail: true },
    });
    if (!p) return NextResponse.json({ error: "This product isn't in the database." }, { status: 404 });
    return NextResponse.json({
      id: p.id,
      name: p.name,
      slug: p.slug,
      isFabric: Boolean(p.fabricDetail),
      images: p.images,
      colourImages: readColourImages((p as { colourImages?: unknown }).colourImages),
      variants: p.variants.map((v) => ({ colour: v.colorName ?? "", size: v.size ?? "", stockQty: v.stockQty })),
    });
  } catch (error) {
    return dbErrorResponse(error);
  }
}

const putSchema = z.object({
  colours: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(40),
        images: z.array(z.string()).max(6).default([]),
      })
    )
    .max(20),
  sizes: z.array(z.string().trim().min(1).max(20)).max(12),
  // Stock for each colour and size. A missing pair means that combination isn't sold.
  cells: z.array(z.object({ colour: z.string().max(40), size: z.string().max(20), stock: z.number().int().min(0).max(100000) })).max(300),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireOwner();
  if (guard.error) return guard.error;
  const { id } = await params;

  const parsed = putSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Those details couldn't be read. Please check and try again." }, { status: 400 });
  const { colours, sizes, cells } = parsed.data;

  if (!cells.length) return NextResponse.json({ error: "Add stock for at least one size and colour." }, { status: 400 });
  for (const c of colours) {
    for (const ref of c.images) {
      const problem = validateImageRef(ref);
      if (problem) return NextResponse.json({ error: `${c.name}: ${problem}` }, { status: 400 });
    }
  }
  const colourSet = new Set(colours.map((c) => c.name.toLowerCase()));
  const sizeSet = new Set(sizes.map((s) => s.toLowerCase()));
  for (const c of cells) {
    if ((c.colour && !colourSet.has(c.colour.toLowerCase())) || (c.size && !sizeSet.has(c.size.toLowerCase()))) {
      return NextResponse.json({ error: "A stock cell doesn't match the colours and sizes listed." }, { status: 400 });
    }
  }

  try {
    const performedById = await auditUserId(guard.user);
    const product = await prisma.product.findUnique({ where: { id }, include: { variants: true, fabricDetail: true } });
    if (!product) return NextResponse.json({ error: "This product isn't in the database." }, { status: 404 });
    if (product.fabricDetail) return NextResponse.json({ error: "Fabrics are sold by the metre and have no sizes or colours." }, { status: 400 });

    const existing = new Map(product.variants.map((v) => [key(v.colorName ?? "", v.size ?? ""), v]));
    const wanted = new Set(cells.map((c) => key(c.colour, c.size)));
    const base = product.variants.find((v) => v.sku.startsWith("SBCM-"))?.sku.split("-")[1] || product.slug;

    await prisma.$transaction(async (tx) => {
      for (const c of cells) {
        const found = existing.get(key(c.colour, c.size));
        if (found) {
          const changed = found.stockQty !== c.stock;
          await tx.productVariant.update({
            where: { id: found.id },
            data: {
              stockQty: c.stock,
              isActive: true,
              colorName: c.colour || null,
              size: c.size || null,
              colorHex: c.colour ? colourHex(c.colour) ?? found.colorHex : null,
            },
          });
          if (changed) {
            await tx.inventoryLog.create({
              data: {
                productId: id,
                variantId: found.id,
                action: "MANUAL_ADJUSTMENT",
                quantityChanged: c.stock - found.stockQty,
                balanceAfter: c.stock,
                reason: "Edited on the product options screen",
                performedById,
              },
            });
          }
        } else {
          let sku = variantSku(base, c.colour, c.size);
          for (let n = 2; await tx.productVariant.findUnique({ where: { sku }, select: { id: true } }); n++) {
            sku = `${variantSku(base, c.colour, c.size)}-${n}`;
          }
          const made = await tx.productVariant.create({
            data: {
              productId: id,
              sku,
              colorName: c.colour || null,
              colorHex: c.colour ? colourHex(c.colour) ?? null : null,
              size: c.size || null,
              stockQty: c.stock,
            },
          });
          if (c.stock > 0) {
            await tx.inventoryLog.create({
              data: {
                productId: id,
                variantId: made.id,
                action: "NEW_STOCK_RECEIPT",
                quantityChanged: c.stock,
                balanceAfter: c.stock,
                reason: "Added on the product options screen",
                performedById,
              },
            });
          }
        }
      }
      // Combinations removed from the grid are hidden, not deleted, so old orders keep their link.
      for (const v of product.variants) {
        if (!wanted.has(key(v.colorName ?? "", v.size ?? "")) && v.isActive) {
          await tx.productVariant.update({ where: { id: v.id }, data: { isActive: false } });
        }
      }

      const withPhotos = colours.filter((c) => c.images.length);
      await tx.product.update({
        where: { id },
        // Cast so this compiles before `prisma generate` picks up the new column.
        data: {
          colourImages: withPhotos.length
            ? Object.fromEntries(withPhotos.map((c) => [c.name, c.images]))
            : Prisma.JsonNull,
        } as unknown as Prisma.ProductUpdateInput,
      });
    });

    revalidateStore();
    await logAdmin(guard.user, "product.options", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return dbErrorResponse(error);
  }
}
