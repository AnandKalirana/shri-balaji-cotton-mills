import type { Metadata } from "next";
import { CollectionSurfer, type CollectionItem } from "@/components/ui/collection-surfer";
import { categories } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop by category",
  description: "Browse fabrics, kurta sets, kurtis, stretchy blouses, saree shapewear and men's wear.",
};

export default function CollectionsPage() {
  const items: CollectionItem[] = categories.map((c, i) => ({
    id: i + 1,
    image: c.image,
    title: c.name,
    href: `/category/${c.slug}`,
  }));

  return <CollectionSurfer items={items} variant="uplift" heading={["SHOP BY", "CATEGORY"]} />;
}
