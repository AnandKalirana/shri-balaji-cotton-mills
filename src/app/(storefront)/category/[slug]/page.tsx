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
    <div className="min-h-screen bg-[#fcf9f4]">
      {/* Category Banner */}
      <section className="bg-[#281b17] text-[#faf7f2] py-12 sm:py-16 md:py-20 border-b border-[#53433e]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2 text-[11px] tracking-widest uppercase font-semibold text-[#c5a880] mb-3">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Collections</span>
          </div>

          <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl font-medium text-white mb-3">
            {category.name}
          </h1>

          <p className="text-sm sm:text-base text-[#d8c2bb] max-w-2xl leading-relaxed">
            {category.description}
          </p>
        </div>
      </section>

      {/* Product Grid Area */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
        {/* Sub-header / Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#ebe3d5]">
          <p className="text-xs tracking-wider uppercase font-semibold text-[#867273]">
            Displaying {categoryProducts.length} Heirloom Creations
          </p>

          {/* Category Pill Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className={`px-3 py-1.5 text-[11px] tracking-wider uppercase font-semibold whitespace-nowrap transition-colors border ${
                  c.slug === slug
                    ? "bg-[#5c1d24] text-white border-[#5c1d24]"
                    : "border-[#ebe3d5] text-[#534343] hover:border-[#c5a880]"
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
            <p className="font-[family-name:var(--font-playfair)] text-xl text-[#2b1e1a] mb-2">
              New Looms in Preparation
            </p>
            <p className="text-xs text-[#867273] mb-6">
              Our master weavers are currently finishing this batch. Check back soon.
            </p>
            <Link
              href="/"
              className="inline-flex px-6 py-3 border border-[#c5a880] text-xs uppercase tracking-widest font-semibold hover:bg-[#faf7f2]"
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

