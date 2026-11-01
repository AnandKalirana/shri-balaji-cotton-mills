"use client";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { useCartStore } from "@/store";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem, toggleCart } = useCartStore();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, product.pricePerMetre ? 2.5 : undefined);
    toggleCart();
  };

  const imageSrc =
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800";

  return (
    <div className="group relative flex flex-col bg-white border border-[#ebe3d5] hover:border-[#c5a880] transition-colors duration-300">
      {/* Image Container with 4:5 aspect ratio */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block w-full aspect-[4/5] overflow-hidden bg-[#f6f3ee]"
      >
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="gold">{product.badge}</Badge>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-[#2b1e1a]/60 flex items-center justify-center">
            <span className="text-[11px] tracking-[0.14em] uppercase font-semibold text-white px-3 py-1 border border-white">
              Archive Only
            </span>
          </div>
        )}

        {/* Quick Add overlay button (desktop hover / mobile icon) */}
        {product.inStock && (
          <button
            onClick={handleQuickAdd}
            aria-label={`Quick add ${product.name} to cart`}
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-11 h-11 bg-[#5c1d24] text-white flex items-center justify-center hover:bg-[#2b1e1a] transition-all duration-300 shadow-md sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        )}
      </Link>

      {/* Details Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 bg-[#fcf9f4]">
        <div>
          {/* Category / Fabric Type */}
          <p className="text-[10px] tracking-[0.14em] uppercase font-semibold text-[#867273]">
            {product.fabricType || product.department}
          </p>

          {/* Title */}
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-[family-name:var(--font-playfair)] text-base sm:text-lg font-medium text-[#2b1e1a] hover:text-[#5c1d24] transition-colors mt-1 line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Metre specs */}
        <div className="pt-2 border-t border-[#ebe3d5] flex items-baseline justify-between gap-2">
          <div>
            <span className="text-base font-semibold text-[#2b1e1a]">
              {formatPrice(product.price)}
            </span>
            {product.pricePerMetre && (
              <span className="block text-[11px] text-[#867273]">
                {formatPrice(product.pricePerMetre)} / metre
              </span>
            )}
          </div>

          <span className="text-[11px] tracking-wider uppercase font-semibold text-[#5c1d24] group-hover:underline">
            View Fabric →
          </span>
        </div>
      </div>
    </div>
  );
}

