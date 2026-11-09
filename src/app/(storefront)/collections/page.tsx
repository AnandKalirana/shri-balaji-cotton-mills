import type { Metadata } from "next";
import { CollectionSurfer, type CollectionItem } from "@/components/ui/collection-surfer";
import { categories } from "@/lib/data";
import { getCategoryImages } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop by category",
  description: "Browse fabrics, kurta sets, kurtis, stretchy blouses, saree shapewear and men's wear.",
};

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  // Each tile shows a real product photo from that category. A category with no products yet is left out.
  const images = await getCategoryImages();
  const items: CollectionItem[] = categories
    .filter((c) => images[c.slug])
    .map((c, i) => ({ id: i + 1, image: images[c.slug], title: c.name, href: `/category/${c.slug}` }));

  if (!items.length) {
    return <p className="px-4 py-24 text-center text-sm text-[#6f6f6f]">Our collections are coming soon.</p>;
  }
  return <CollectionSurfer items={items} variant="uplift" heading={["SHOP BY", "CATEGORY"]} />;
}
