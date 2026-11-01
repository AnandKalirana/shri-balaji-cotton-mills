import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { products as fallbackProducts, categories as fallbackCategories } from "@/lib/data";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    try {
      const where: any = { isActive: true };
      if (categorySlug) {
        where.category = { slug: categorySlug };
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }
      if (featured === "true") {
        where.isFeatured = true;
      }

      const products = await prisma.product.findMany({
        where,
        include: {
          category: true,
          fabricDetail: true,
          variants: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (products && products.length > 0) {
        return NextResponse.json({ products });
      }
    } catch {
      // Fallback to static mock data if DB has not been seeded yet
    }

    let filtered = [...fallbackProducts];
    if (categorySlug) {
      filtered = filtered.filter((p) => p.category === categorySlug);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ products: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

