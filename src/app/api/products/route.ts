import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { products } = await getProducts({
      category: searchParams.get("category"),
      search: searchParams.get("search"),
      limit: Math.min(Number(searchParams.get("limit")) || 100, 100),
    });
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Search failed" }, { status: 500 });
  }
}
