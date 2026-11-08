import { categories } from "@/lib/data";
import { getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} — Handcrafted Textiles`,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const { products: categoryProducts } = await getProducts({ category: slug });

  return (
    <div className="min-h-screen bg-white">
      {/* Category Banner */}
      <section className="bg-ink-deep text-cream py-12 sm:py-16 md:py-20 border-b border-charcoal">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2 text-xs font-medium text-sand mb-3">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Collections</span>
          </div>

          <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl font-medium text-white mb-3">
            {category.name}
          </h1>

          <p className="text-sm sm:text-base text-blush max-w-2xl leading-relaxed">
            {category.description}
          </p>
        </div>
      </section>

      {/* Product Grid Area */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
        {/* Sub-header / Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-line">
          <p className="text-xs font-medium text-muted">
            Displaying {categoryProducts.length} Heirloom Creations
          </p>

          {/* Category Pill Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors border ${
                  c.slug === slug
                    ? "bg-wine text-white border-wine"
                    : "border-line text-graphite hover:border-sand"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Adaptive Grid */}
        {categoryProducts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-[family-name:var(--font-playfair)] text-xl text-ink mb-2">
              New Looms in Preparation
            </p>
            <p className="text-xs text-muted mb-6">
              Our master weavers are currently finishing this batch. Check back soon.
            </p>
            <Link
              href="/"
              className="inline-flex px-6 py-3 border border-sand text-xs font-medium hover:bg-cream"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {categoryProducts.map((prod, idx) => (
              <ProductCard key={prod.id} product={prod} priority={idx < 2} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

