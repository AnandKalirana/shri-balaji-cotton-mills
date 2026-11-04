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


const OLD_CATEGORY_SLUGS = [
  "silk-sarees",
  "banarasi-brocade",
  "handloom-fabrics",
  "bridal-collection",
  "dress-materials",
  "zari-embroidery",
];
// Sample products from the first version of the catalogue that no longer fit the new categories.
const OLD_SAMPLE_PRODUCT_SLUGS = [
  "royal-maroon-banarasi-silk",
  "ivory-bridal-lehenga-set",
  "navy-kantha-stitch-cotton",
  "gold-zari-border-dupatta",
];

/**
 * Makes the database categories match the store's current list (Fabrics, Kurta Set, Kurti,
 * Stretchy Blouse, Saree Shapewear). Safe to run repeatedly:
 *  - creates/updates the current categories
 *  - removes old sample products that were never ordered, moves any other product from an old
 *    category into Fabrics, then removes the old categories
 *  - points banner buttons that linked to an old category at Fabrics
 */
export async function syncCategories(db: PrismaClient) {
  for (const c of demoCategories) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, imageUrl: c.image, sortOrder: Number(c.id), isActive: true },
      create: { name: c.name, slug: c.slug, description: c.description, imageUrl: c.image, sortOrder: Number(c.id) },
    });
  }
  const fabrics = await db.category.findUniqueOrThrow({ where: { slug: "fabrics" } });

  for (const slug of OLD_SAMPLE_PRODUCT_SLUGS) {
    const prod = await db.product.findUnique({ where: { slug }, include: { _count: { select: { orderItems: true } } } });
    if (!prod) continue;
    try {
      if (prod._count.orderItems > 0) throw new Error("has orders");
      await db.product.delete({ where: { id: prod.id } });
    } catch {
      await db.product.update({ where: { id: prod.id }, data: { categoryId: fabrics.id, isActive: false } });
    }
  }

  // Two garments were first seeded as "fabric by the metre" by mistake; remove them (if never ordered) so they re-import correctly.
  for (const slug of ["maroon-cotton-silk-kurta-set", "navy-kantha-cotton-kurti"]) {
    const prod = await db.product.findUnique({ where: { slug }, include: { _count: { select: { orderItems: true } } } });
    if (prod && prod.type === "FABRIC_BY_METRE" && prod._count.orderItems === 0) {
      await db.product.delete({ where: { id: prod.id } });
    }
  }

  for (const slug of OLD_CATEGORY_SLUGS) {
    const old = await db.category.findUnique({ where: { slug } });
    if (!old) continue;
    await db.product.updateMany({ where: { categoryId: old.id }, data: { categoryId: fabrics.id } });
    await db.category.delete({ where: { id: old.id } }).catch(() => db.category.update({ where: { id: old.id }, data: { isActive: false } }));
    await db.banner.updateMany({ where: { ctaLink: `/category/${slug}` }, data: { ctaLink: "/category/fabrics" } });
  }
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
  await syncCategories(db);
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
