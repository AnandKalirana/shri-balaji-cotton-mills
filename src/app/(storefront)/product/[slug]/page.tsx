import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/catalog";
import { ProductDetailView } from "@/components/store/ProductDetailView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.description.slice(0, 160) };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ colour?: string }>;
}) {
  const { slug } = await params;
  const { colour } = await searchParams;
  const { product } = await getProductBySlug(slug);
  if (!product) notFound();
  return <ProductDetailView product={product} initialColour={colour} />;
}
