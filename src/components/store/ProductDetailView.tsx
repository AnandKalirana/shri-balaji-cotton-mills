"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Stepper } from "@/components/ui/Stepper";
import { Badge } from "@/components/ui/Badge";
import { useCartStore } from "@/store";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function ProductDetailView({ product }: { product: Product }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [metres, setMetres] = useState(2.5);
  const [isFullThaan, setIsFullThaan] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addItem, toggleCart } = useCartStore();

  const isFabric = Boolean(product.pricePerMetre);
  const standardThaanMetres = 25.0;
  const thaanDiscountPct = 12;

  // Price calculations
  let currentPrice = product.price;
  if (isFabric && product.pricePerMetre) {
    if (isFullThaan) {
      const gross = standardThaanMetres * product.pricePerMetre;
      currentPrice = Math.round(gross * (1 - thaanDiscountPct / 100));
    } else {
      currentPrice = Math.round(metres * product.pricePerMetre);
    }
  }

  const handleAddToCart = () => {
    addItem(
      { ...product, price: currentPrice },
      quantity,
      isFabric ? (isFullThaan ? standardThaanMetres : metres) : undefined
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    toggleCart();
  };

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800"];

  return (
    <div className="min-h-screen bg-[#ffffff] pb-24 sm:pb-16">
      {/* Breadcrumb Bar */}
      <div className="border-b border-[#e5e5e3] bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center gap-2 text-xs font-medium text-[#6f6f6f]">
          <Link href="/" className="hover:text-[#1a1a1a]">Home</Link>
          <span>/</span>
          <Link href={`/category/${product.category}`} className="hover:text-[#1a1a1a]">
            {product.department}
          </Link>
          <span>/</span>
          <span className="text-[#1a1a1a] truncate max-w-[180px] sm:max-w-none">
            {product.name}
          </span>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

          {/* Left Column: Image Gallery (Mobile Touch Swipe + Desktop Stack) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Stage Image */}
            <div className="relative aspect-[4/5] w-full bg-[#f3f3f1] border border-[#e5e5e3] overflow-hidden select-none">
              <Image
                src={images[activeImageIndex]}
                alt={product.name}
                fill
                priority
                className="object-cover object-center"
              />

              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge variant="gold">{product.badge}</Badge>
                </div>
              )}

              {/* Mobile Arrows */}
              {images.length > 1 && (
                <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none sm:hidden">
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        (prev - 1 + images.length) % images.length
                      )
                    }
                    className="w-10 h-10 bg-white flex items-center justify-center pointer-events-auto text-[#1a1a1a]"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev + 1) % images.length)
                    }
                    className="w-10 h-10 bg-white flex items-center justify-center pointer-events-auto text-[#1a1a1a]"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails row */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-none py-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-24 shrink-0 border-2 transition-all ${
                      activeImageIndex === idx
                        ? "border-[#5c1d24]"
                        : "border-[#e5e5e3] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Textile Specs, Metre Stepper, Buy Options */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <span className="text-xs font-medium text-[#5c1d24]">
              {product.fabricType || product.department}
            </span>

            <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl md:text-4xl font-normal text-[#1a1a1a] mt-2 mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="bg-[#f5f5f3] p-4 sm:p-5 border border-[#e5e5e3] mb-6">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl sm:text-3xl font-semibold text-[#1a1a1a]">
                  {formatPrice(currentPrice)}
                  {product.mrp && !isFabric && (
                    <span className="ml-3 text-base font-normal text-[#6f6f6f] line-through tabular-nums">{formatPrice(product.mrp)}</span>
                  )}
                </span>
                {product.pricePerMetre && !isFullThaan && (
                  <span className="text-xs text-[#444444]">
                    ({formatPrice(product.pricePerMetre)} / metre)
                  </span>
                )}
              </div>

              {isFullThaan && (
                <p className="text-xs text-emerald-800 font-semibold mt-1">
                  Includes {thaanDiscountPct}% Bulk Thaan Roll Savings
                </p>
              )}

              <p className="text-[11px] text-[#6f6f6f] mt-2">
                Inclusive of 5% GST
              </p>
            </div>

            {/* Fabric Metre Selector & Thaan Option */}
            {isFabric && (
              <div className="border border-[#c5a880] p-4 sm:p-5 bg-white mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#1a1a1a]">
                    Select Yardage Mode
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFullThaan(false)}
                      className={`px-3 py-1 text-xs font-medium border ${
                        !isFullThaan
                          ? "bg-[#5c1d24] text-white border-[#5c1d24]"
                          : "border-[#e5e5e3] text-[#444444]"
                      }`}
                    >
                      Custom Metres
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFullThaan(true)}
                      className={`px-3 py-1 text-xs font-medium border ${
                        isFullThaan
                          ? "bg-[#5c1d24] text-white border-[#5c1d24]"
                          : "border-[#e5e5e3] text-[#444444]"
                      }`}
                    >
                      Full Thaan (25m)
                    </button>
                  </div>
                </div>

                {!isFullThaan ? (
                  <div>
                    <Stepper
                      label="Custom Cut Length (0.5m increments)"
                      value={metres}
                      onChange={setMetres}
                      min={1.0}
                      max={50.0}
                      step={0.5}
                      unit="metres"
                      large
                    />
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {[1.5, 2.5, 3.5, 5.0].map((quick) => (
                        <button
                          key={quick}
                          onClick={() => setMetres(quick)}
                          className="px-2.5 py-1 text-xs bg-[#f3f3f1] border border-[#e5e5e3] hover:border-[#c5a880] text-[#1a1a1a]"
                        >
                          {quick}m {quick === 1.5 ? "(Blouse)" : quick === 2.5 ? "(Kurta)" : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[#444444] space-y-1">
                    <p>• Standard wholesale bolt length: <strong>25.0 metres</strong></p>
                    <p>• Suitable for stitching kurtas, blouses and suits, and for boutique use.</p>
                  </div>
                )}
              </div>
            )}

            {/* Standard Quantity Stepper */}
            {!isFabric && (
              <div className="mb-6">
                <Stepper
                  label="Quantity"
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={product.stockQty || 10}
                />
              </div>
            )}

            {/* Add to Cart Desktop Button */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="hidden sm:flex w-full py-4 bg-[#5c1d24] hover:bg-[#1a1a1a] text-white text-xs font-medium items-center justify-center gap-3 transition-colors min-h-[52px] disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {added
                  ? "Added to bag"
                  : product.inStock
                  ? `Add to Bag • ${formatPrice(currentPrice)}`
                  : "Currently Out of Stock"}
              </span>
            </button>

            {/* Textile Attributes Accordion / Specs */}
            <div className="mt-8 border-t border-[#e5e5e3] pt-6 space-y-4">
              <h4 className="text-xs font-medium text-[#6f6f6f]">
                Artisanal Specifications
              </h4>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#6f6f6f] block">Weave / Technique</span>
                  <span className="font-semibold text-[#1a1a1a]">{product.fabricType}</span>
                </div>
                <div>
                  <span className="text-[#6f6f6f] block">Composition</span>
                  <span className="font-semibold text-[#1a1a1a]">{product.composition}</span>
                </div>
                <div>
                  <span className="text-[#6f6f6f] block">Fabric Width</span>
                  <span className="font-semibold text-[#1a1a1a]">{product.width || "44 inches"}</span>
                </div>
                <div>
                  <span className="text-[#6f6f6f] block">Care</span>
                  <span className="font-semibold text-[#1a1a1a]">{product.care || "Dry clean only"}</span>
                </div>
              </div>

              <p className="text-xs text-[#444444] leading-relaxed pt-2">
                {product.description}
              </p>
            </div>

            {/* Assurance Badges */}
            <div className="mt-6 border-t border-[#e5e5e3] pt-4 space-y-2 text-xs text-[#444444]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Quality checked before dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#5c1d24]" />
                <span>Dispatched in 1–2 working days</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#725b38]" />
                <span>Easy 7-day exchange on uncut fabric</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile Phones (360px-430px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#ffffff] border-t border-[#c5a880] p-3 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-xs text-[#6f6f6f] block">
            {isFabric ? (isFullThaan ? "Full Thaan" : `${metres}m Cut`) : "Total"}
          </span>
          <span className="text-base font-semibold text-[#1a1a1a]">
            {formatPrice(currentPrice)}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="flex-1 py-3.5 bg-[#5c1d24] text-white text-xs font-medium flex items-center justify-center gap-2 active:bg-[#1a1a1a] min-h-[48px]"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{added ? "Added" : "Add to Bag"}</span>
        </button>
      </div>
    </div>
  );
}

