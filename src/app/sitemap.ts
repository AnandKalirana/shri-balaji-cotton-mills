import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { categories } from "@/lib/data";
import { siteBase } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteBase();
  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/collections`, changeFrequency: "weekly", priority: 0.8 },
    ...categories.map((c) => ({ url: `${base}/category/${c.slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
    ...["contact", "shipping-policy", "returns-and-refunds", "privacy-policy", "terms"].map((p) => ({
      url: `${base}/${p}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
  try {
    const rows = await prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true }, take: 5000 });
    return [...pages, ...rows.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 }))];
  } catch {
    return pages;
  }
}
