"use client";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store";
import { isLightHex } from "@/lib/colours";
import { ShoppingBag, Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const router = useRouter();
  const { addItem, toggleCart } = useCartStore();
  const colours = product.options?.colours ?? [];
  const hasChoices = Boolean(product.options?.variants.length);
  const wishlisted = useWishlistStore((st) => st.ids.includes(product.id));
  const toggleWishlist = useWishlistStore((st) => st.toggle);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Products with sizes or colours need a choice first, so open the product page.
    if (hasChoices) {
      router.push(`/product/${product.slug}`);
      return;
    }
    addItem(product, 1, product.pricePerMetre ? 2.5 : undefined);
    toggleCart();
  };

  const imageSrc =
    product.images?.[0] ||
    "/placeholder.png";

  return (
    <div className="group relative flex flex-col bg-white">
      {/* Image Container with 4:5 aspect ratio */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block w-full aspect-[4/5] overflow-hidden bg-fog"
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
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center text-wine hover:bg-white press"
        >
          <Heart key={String(wishlisted)} className={wishlisted ? "w-4 h-4 fill-wine heart-pop" : "w-4 h-4"} />
        </button>

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-ink/60 flex items-center justify-center">
            <span className="text-xs font-medium text-white px-3 py-1 rounded-full border border-white">
              Archive Only
            </span>
          </div>
        )}

        {/* Quick Add overlay button (desktop hover / mobile icon) */}
        {product.inStock && (
          <button
            onClick={handleQuickAdd}
            aria-label={hasChoices ? `Choose size and colour for ${product.name}` : `Quick add ${product.name} to cart`}
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-11 h-11 rounded-full bg-white text-ink flex items-center justify-center hover:bg-ink hover:text-white active:scale-90 transition-[transform,background-color,color,opacity] duration-300 shadow-lg sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        )}
      </Link>

      {/* Details Area */}
      <div className="pt-3 pb-1 flex flex-col flex-1 justify-between gap-2 bg-white">
        <div>
          {/* Category / Fabric Type */}
          <p className="text-xs font-medium text-muted">
            {product.fabricType || product.department}
          </p>

          {/* Title */}
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-[family-name:var(--font-playfair)] text-sm sm:text-base font-medium text-ink hover:underline mt-1 line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {colours.length > 1 && (
          <div className="flex items-center gap-1.5" aria-label={`${colours.length} colours`}>
            {colours.slice(0, 5).map((c) => (
              <span
                key={c.name}
                title={c.name}
                className={"w-3.5 h-3.5 rounded-full " + (isLightHex(c.hex) ? "border border-black/20" : "")}
                style={{ background: c.hex }}
              />
            ))}
            {colours.length > 5 && <span className="text-[11px] text-muted">+{colours.length - 5}</span>}
            <span className="text-[11px] text-muted ml-1">{colours.length} colours</span>
          </div>
        )}

        {/* Price & Metre specs */}
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="text-sm font-medium text-ink tabular-nums">
              {formatPrice(product.price)}
            </span>
            {product.mrp && (
              <span className="ml-2 text-xs text-muted line-through tabular-nums">{formatPrice(product.mrp)}</span>
            )}
            {product.pricePerMetre && (
              <span className="block text-[11px] text-muted">
                {formatPrice(product.pricePerMetre)} / metre
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

