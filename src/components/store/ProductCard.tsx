"use client";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { useCartStore } from "@/store";
import { ShoppingBag, Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem, toggleCart } = useCartStore();
  const wishlisted = useWishlistStore((st) => st.ids.includes(product.id));
  const toggleWishlist = useWishlistStore((st) => st.toggle);

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
    <div className="group relative flex flex-col bg-white">
      {/* Image Container with 4:5 aspect ratio */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block w-full aspect-[4/5] overflow-hidden bg-[#f3f3f1]"
      >
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
          className="object-cover object-center "
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="gold">{product.badge}</Badge>
          </div>
        )}

        {/* Wishlist heart */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#5c1d24] hover:bg-white active:scale-90 transition-all"
        >
          <Heart className={wishlisted ? "w-4 h-4 fill-[#5c1d24]" : "w-4 h-4"} />
        </button>

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-[#1a1a1a]/60 flex items-center justify-center">
            <span className="text-xs font-medium text-white px-3 py-1 rounded-full border border-white">
              Archive Only
            </span>
          </div>
        )}

        {/* Quick Add overlay button (desktop hover / mobile icon) */}
        {product.inStock && (
          <button
            onClick={handleQuickAdd}
            aria-label={`Quick add ${product.name} to cart`}
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-11 h-11 rounded-full bg-white text-[#1a1a1a] flex items-center justify-center hover:bg-[#1a1a1a] hover:text-white active:scale-90 transition-all duration-300 shadow-lg sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        )}
      </Link>

      {/* Details Area */}
      <div className="pt-3 pb-1 flex flex-col flex-1 justify-between gap-2 bg-white">
        <div>
          {/* Category / Fabric Type */}
          <p className="text-xs font-medium text-[#6f6f6f]">
            {product.fabricType || product.department}
          </p>

          {/* Title */}
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-[family-name:var(--font-playfair)] text-sm sm:text-base font-medium text-[#1a1a1a] hover:underline mt-1 line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Metre specs */}
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="text-sm font-medium text-[#1a1a1a] tabular-nums">
              {formatPrice(product.price)}
            </span>
            {product.mrp && (
              <span className="ml-2 text-xs text-[#6f6f6f] line-through tabular-nums">{formatPrice(product.mrp)}</span>
            )}
            {product.pricePerMetre && (
              <span className="block text-[11px] text-[#6f6f6f]">
                {formatPrice(product.pricePerMetre)} / metre
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

