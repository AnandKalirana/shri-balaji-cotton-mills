import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getStoreSettings } from "@/lib/catalog";
import { siteBase } from "@/lib/site";
import { ProductDetailView } from "@/components/store/ProductDetailView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const description = (product.description || `${product.name} from Shri Balaji Cotton Mills`).replace(/\s+/g, " ").slice(0, 160);
  const image = product.images?.[0];
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { type: "website", title: product.name, description, url: `/product/${product.slug}`, ...(image ? { images: [{ url: image }] } : {}) },
    twitter: { card: image ? "summary_large_image" : "summary", title: product.name, description, ...(image ? { images: [image] } : {}) },
  };
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
  const settings = await getStoreSettings();
  const image = product.images?.[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url: `${siteBase()}/product/${product.slug}`,
    ...(image ? { image: image.startsWith("http") ? image : `${siteBase()}${image}` } : {}),
    brand: { "@type": "Brand", name: "Shri Balaji Cotton Mills" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.pricePerMetre ?? product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteBase()}/product/${product.slug}`,
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ProductDetailView product={product} initialColour={colour} whatsappPhone={settings.supportPhone} />
    </>
  );
}
