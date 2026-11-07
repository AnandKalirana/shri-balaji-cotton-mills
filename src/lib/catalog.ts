import { prisma } from "@/lib/prisma";
import { products as demoProducts, categories as demoCategories, orders as demoOrders } from "@/lib/data";
import { DEFAULT_SETTINGS, type StoreSettingsData } from "@/lib/hero";
import type { Product, Category, Order, ProductOptions } from "@/lib/types";
import { colourHex, NEUTRAL_SWATCH, sortSizes } from "@/lib/colours";

/**
 * Single read layer for the catalogue, used by both the storefront and the admin.
 *
 * - Database reachable and has products  -> real data.
 * - Database unreachable or has no products -> built-in demo data (flagged `demo: true`),
 *   so the site never looks broken, and the admin can tell the owner changes can't be saved.
 */

const productInclude = { category: true, fabricDetail: true, variants: true } as const;

// Loose row type so this file also compiles before `prisma generate` has been run.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbProduct = any;

/** Builds the size and colour choices from a product's variants. Null when it has none. */
export function buildOptions(p: DbProduct): ProductOptions | undefined {
  type V = { id: string; sku: string; size?: string | null; colorName?: string | null; colorHex?: string | null; stockQty: number; isActive: boolean };
  const variants = ((p.variants ?? []) as V[]).filter((v) => v.isActive && (v.size || v.colorName));
  if (!variants.length) return undefined;

  const images = (p.colourImages && typeof p.colourImages === "object" ? p.colourImages : {}) as Record<string, string[]>;
  const colours: ProductOptions["colours"] = [];
  for (const v of variants) {
    const name = v.colorName?.trim();
    if (name && !colours.some((c) => c.name === name)) {
      colours.push({ name, hex: v.colorHex || colourHex(name) || NEUTRAL_SWATCH, images: Array.isArray(images[name]) ? images[name] : [] });
    }
  }
  const sizes = sortSizes([...new Set(variants.map((v) => v.size?.trim()).filter((s): s is string => Boolean(s)))]);
  return {
    sizes,
    colours,
    variants: variants.map((v) => ({ id: v.id, sku: v.sku, size: v.size?.trim() ?? "", colour: v.colorName?.trim() ?? "", stockQty: v.stockQty })),
  };
}

export function mapProduct(p: DbProduct): Product {
  const fabric = p.fabricDetail;
  const stockQty = fabric
    ? Number(fabric.totalMetresInStock)
    : (p.variants ?? []).reduce(
        (sum: number, v: { isActive: boolean; stockQty: number }) => sum + (v.isActive ? v.stockQty : 0),
        0
      );

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category?.slug ?? "",
    department: p.category?.name ?? "",
    price: Number(p.salePrice ?? p.basePrice),
    mrp: p.salePrice != null && Number(p.basePrice) > Number(p.salePrice) ? Number(p.basePrice) : undefined,
    pricePerMetre: fabric ? Number(fabric.pricePerMetre) : undefined,
    images: p.images ?? [],
    options: buildOptions(p),
    description: p.description ?? "",
    fabricType: p.weaveType || p.category?.name || "",
    composition: p.composition || "",
    width: fabric ? `${Number(fabric.widthInches)} inches` : undefined,
    care: p.careInstructions || undefined,
    inStock: Boolean(p.isActive) && stockQty > 0,
    stockQty,
    tags: [],
    badge: p.badge || undefined,
    isActive: Boolean(p.isActive),
  };
}

function matchesDemo(p: Product, tokens: string[]) {
  const hay = [p.name, p.description, p.fabricType, p.composition, p.department, p.badge, ...p.tags]
    .join(" ")
    .toLowerCase();
  return tokens.every((t) => hay.includes(t));
}

export function searchTokens(q?: string | null): string[] {
  return (q ?? "")
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 5);
}

interface ProductQuery {
  category?: string | null;
  search?: string | null;
  includeInactive?: boolean;
  limit?: number;
}

/** True when the database is reachable and holds at least one product. */
export async function catalogIsLive(): Promise<boolean> {
  try {
    return (await prisma.product.count()) > 0;
  } catch {
    return false;
  }
}

export async function getProducts(q: ProductQuery = {}): Promise<{ products: Product[]; demo: boolean }> {
  const tokens = searchTokens(q.search);
  try {
    const total = await prisma.product.count();
    if (total > 0) {
      const rows = await prisma.product.findMany({
        where: {
          ...(q.includeInactive ? {} : { isActive: true }),
          ...(q.category ? { category: { slug: q.category } } : {}),
          ...(tokens.length
            ? {
                AND: tokens.map((t) => ({
                  OR: [
                    { name: { contains: t, mode: "insensitive" as const } },
                    { description: { contains: t, mode: "insensitive" as const } },
                    { shortDesc: { contains: t, mode: "insensitive" as const } },
                    { weaveType: { contains: t, mode: "insensitive" as const } },
                    { composition: { contains: t, mode: "insensitive" as const } },
                    { origin: { contains: t, mode: "insensitive" as const } },
                    { badge: { contains: t, mode: "insensitive" as const } },
                    { category: { name: { contains: t, mode: "insensitive" as const } } },
                  ],
                })),
              }
            : {}),
        },
        include: productInclude,
        orderBy: { createdAt: "desc" },
        ...(q.limit ? { take: q.limit } : {}),
      });
      return { products: rows.map(mapProduct), demo: false };
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.warn("[catalog] database unavailable:", (err as Error).message);
  }

  let list = [...demoProducts];
  if (q.category) list = list.filter((p) => p.category === q.category);
  if (tokens.length) list = list.filter((p) => matchesDemo(p, tokens));
  if (q.limit) list = list.slice(0, q.limit);
  return { products: list, demo: true };
}

export async function getProductBySlug(slug: string): Promise<{ product: Product | null; demo: boolean }> {
  try {
    if ((await prisma.product.count()) > 0) {
      const row = await prisma.product.findUnique({ where: { slug }, include: productInclude });
      return { product: row && row.isActive ? mapProduct(row) : null, demo: false };
    }
  } catch {
    // fall through to demo data
  }
  return { product: demoProducts.find((p) => p.slug === slug) ?? null, demo: true };
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const { products } = await getProducts();
  return products.filter((p) => ids.includes(p.id));
}

export async function getCategories(): Promise<Category[]> {
  return demoCategories;
}

export async function getStoreSettings(): Promise<StoreSettingsData & { demo: boolean }> {
  try {
    const row = await prisma.storeSettings.findUnique({ where: { id: "default" } });
    if (row) {
      return {
        storeName: row.storeName,
        supportEmail: row.supportEmail,
        supportPhone: row.supportPhone,
        legalName: row.legalName,
        gstin: row.gstin,
        address: row.address,
        businessHours: row.businessHours,
        instagramUrl: row.instagramUrl,
        facebookUrl: row.facebookUrl,
        youtubeUrl: row.youtubeUrl,
        freeShippingThreshold: Number(row.freeShippingThreshold),
        standardShippingFee: Number(row.standardShippingFee),
        enableCod: row.enableCod,
        codMaxOrderLimit: Number(row.codMaxOrderLimit),
        announcementText: row.announcementText,
        enableAnnouncement: row.enableAnnouncement,
        demo: false,
      };
    }
  } catch {
    // fall through
  }
  return { ...DEFAULT_SETTINGS, demo: true };
}

export async function getActiveBanner() {
  try {
    return await prisma.banner.findFirst({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });
  } catch {
    return null;
  }
}

/** Maps a database order row to the shape the admin screens use. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapOrder(o: any): Order {
  const snap = (o.shippingAddressSnapshot ?? {}) as Record<string, string | undefined>;
  const status = String(o.orderStatus ?? "").toLowerCase();
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customer: { name: o.customerName, email: o.customerEmail, phone: o.customerPhone },
    items: (o.items ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (i: any) => ({
        product: {
          id: i.productId,
          name: i.productName,
          slug: "",
          category: "",
          department: "",
          price: Number(i.unitPrice),
          images: [],
          description: "",
          fabricType: "",
          composition: "",
          inStock: true,
          stockQty: 0,
          tags: [],
        },
        quantity: i.quantity,
        metres: i.metres != null ? Number(i.metres) : undefined,
        isFullThaan: i.isFullThaan,
      })
    ),
    total: Number(o.total),
    status: (status === "pending_payment" ? "pending" : status) as Order["status"],
    createdAt: new Date(o.createdAt).toISOString(),
    shippingAddress: {
      street: snap.street || snap.address || snap.line1 || "",
      city: snap.city || "",
      state: snap.state || "",
      pincode: snap.pincode || snap.postalCode || "",
    },
  };
}

export { demoOrders };
