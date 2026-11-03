import type { PrismaClient } from "@prisma/client";
import { categories as demoCategories, products as demoProducts } from "@/lib/data";

/** Make sure a category row exists for a slug (built-in categories are created on demand). */
export async function ensureCategory(db: PrismaClient, slug: string) {
  const existing = await db.category.findUnique({ where: { slug } });
  if (existing) return existing;
  const demo = demoCategories.find((c) => c.slug === slug);
  if (!demo) return null;
  return db.category.create({
    data: {
      name: demo.name,
      slug: demo.slug,
      description: demo.description,
      imageUrl: demo.image,
      sortOrder: Number(demo.id),
    },
  });
}

/** Turn a title into a URL slug that isn't used by any other product. */
export async function uniqueSlug(db: PrismaClient, title: string) {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "product";
  let slug = base;
  for (let i = 2; await db.product.findUnique({ where: { slug } }); i++) slug = `${base}-${i}`;
  return slug;
}

/**
 * Copies the built-in sample catalogue into the database (skipping slugs that already exist).
 * Used by `prisma db seed` and by the "Import sample catalogue" button in the admin.
 */
export async function importSampleCatalog(db: PrismaClient) {
  let created = 0;
  for (const p of demoProducts) {
    if (await db.product.findUnique({ where: { slug: p.slug } })) continue;
    const category = await ensureCategory(db, p.category);
    if (!category) continue;

    const isFabric = Boolean(p.pricePerMetre);
    const width = parseFloat(p.width ?? "") || 44;

    await db.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        type: isFabric ? "FABRIC_BY_METRE" : "STANDARD_PRODUCT",
        categoryId: category.id,
        basePrice: p.price,
        images: p.images,
        badge: p.badge ?? null,
        isActive: p.inStock || p.stockQty > 0,
        weaveType: p.fabricType,
        composition: p.composition,
        careInstructions: p.care ?? null,
        ...(isFabric
          ? {
              fabricDetail: {
                create: {
                  widthInches: width,
                  pricePerMetre: p.pricePerMetre!,
                  totalMetresInStock: p.stockQty,
                  cutMetresAvailable: p.stockQty,
                },
              },
            }
          : {
              variants: {
                create: { sku: `SBCM-${p.slug}`.toUpperCase().slice(0, 40), stockQty: p.stockQty },
              },
            }),
      },
    });
    created++;
  }
  return created;
}
