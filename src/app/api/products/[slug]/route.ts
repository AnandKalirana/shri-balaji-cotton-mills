import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { products as fallbackProducts } from "@/lib/data";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    try {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          fabricDetail: true,
          variants: true,
          reviews: {
            include: { user: { select: { fullName: true } } },
          },
        },
      });

      if (product) {
        return NextResponse.json({ product });
      }
    } catch {
      // Fallback
    }

    const fallback = fallbackProducts.find((p) => p.slug === slug);
    if (!fallback) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: fallback });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

