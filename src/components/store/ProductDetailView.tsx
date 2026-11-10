"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { isLightHex } from "@/lib/colours";
import { Stepper } from "@/components/ui/Stepper";
import { Badge } from "@/components/ui/Badge";
import { useCartStore } from "@/store";
import { ShoppingBag, ChevronLeft, ChevronRight, Truck, ShieldCheck, RotateCcw, ChevronDown } from "lucide-react";

const FALLBACK_IMG = "/placeholder.png";

export function ProductDetailView({ product, initialColour }: { product: Product; initialColour?: string }) {
  const options = product.options;
  const colours = useMemo(() => options?.colours ?? [], [options]);
  const sizes = options?.sizes ?? [];
  const variants = useMemo(() => options?.variants ?? [], [options]);

  // Start on the colour from the link, otherwise the first colour that is in stock.
  const firstColour = useMemo(() => {
    const fromLink = colours.find((c) => c.name.toLowerCase() === (initialColour ?? "").toLowerCase());
    if (fromLink) return fromLink.name;
    return colours.find((c) => variants.some((v) => v.colour === c.name && v.stockQty > 0))?.name ?? colours[0]?.name ?? "";
  }, [colours, variants, initialColour]);

  const [colourName, setColourName] = useState(firstColour);
  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : "");
  const [activeImage, setActiveImage] = useState(0);
  const [metres, setMetres] = useState(2.5);
  const [isFullThaan, setIsFullThaan] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [nudge, setNudge] = useState(0); // bumps each time someone taps Add without a size
  const [showMissing, setShowMissing] = useState(false);
  const [touchX, setTouchX] = useState<number | null>(null);

  const { addItem, toggleCart } = useCartStore();

  const isFabric = Boolean(product.pricePerMetre);
  const standardThaanMetres = 25.0;
  const thaanDiscountPct = 12;

  const colour = colours.find((c) => c.name === colourName);
  const images = colour?.images.length ? colour.images : product.images?.length ? product.images : [FALLBACK_IMG];
  const safeIndex = Math.min(activeImage, images.length - 1);

  const stockOf = (c: string, s: string) => variants.find((v) => v.colour === c && v.size === s)?.stockQty ?? 0;
  const selectedVariant = options ? variants.find((v) => v.colour === (colour?.name ?? "") && v.size === size) : undefined;
  const sizeStock = (s: string) => stockOf(colour?.name ?? "", s);
  const colourInStock = (c: string) => variants.some((v) => v.colour === c && v.stockQty > 0);

  const needsSize = sizes.length > 0;
  const missingSize = needsSize && !size;
  const available = isFabric
    ? product.inStock
    : options
    ? colourInStock(colour?.name ?? "") || !colours.length && variants.some((v) => v.stockQty > 0)
    : product.inStock;
  const maxQty = Math.max(1, Math.min(10, options ? selectedVariant?.stockQty ?? 10 : product.stockQty || 10));

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
  const showMrp = product.mrp && !isFabric;
  const percentOff = showMrp ? Math.round(((product.mrp! - product.price) / product.mrp!) * 100) : 0;

  const chooseColour = (name: string) => {
    setColourName(name);
    setActiveImage(0);
    if (size && stockOf(name, size) === 0) setSize("");
    try {
      window.history.replaceState(null, "", `?colour=${encodeURIComponent(name)}`);
    } catch {
      /* the link just won't update */
    }
  };

  const handleAddToCart = () => {
    if (missingSize) {
      setShowMissing(true);
      setNudge((n) => n + 1);
      document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (options && !selectedVariant) return;
    addItem(
      { ...product, price: currentPrice },
      quantity,
      isFabric ? (isFullThaan ? standardThaanMetres : metres) : undefined,
      selectedVariant
        ? { variantId: selectedVariant.id, size: selectedVariant.size || undefined, colour: selectedVariant.colour || undefined, image: images[0] }
        : undefined
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    toggleCart();
  };

  const step = (dir: 1 | -1) => setActiveImage((safeIndex + dir + images.length) % images.length);
  const ctaLabel = added
    ? "Added to bag"
    : !available
    ? "Out of stock"
    : missingSize
    ? "Select a size"
    : `Add to bag · ${formatPrice(currentPrice * (isFabric ? 1 : quantity))}`;

  return (
    <div className="bg-white pb-28 sm:pb-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 pt-5 pb-2 flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span aria-hidden>/</span>
        <Link href={`/category/${product.category}`} className="hover:text-ink">{product.department}</Link>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14">
          {/* Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse lg:flex-row gap-3 lg:gap-4">
            {images.length > 1 && (
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[720px] scrollbar-none shrink-0">
                {images.map((img, idx) => (
                  <button
                    key={img + idx}
                    onClick={() => setActiveImage(idx)}
                    aria-label={`Show photo ${idx + 1}`}
                    aria-current={idx === safeIndex}
                    className={cn(
                      "relative w-16 h-20 lg:w-[72px] lg:h-[90px] shrink-0 overflow-hidden bg-fog border transition-colors",
                      idx === safeIndex ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    <Image src={img} alt="" fill sizes="72px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div
              className="relative flex-1 aspect-[4/5] bg-fog overflow-hidden select-none"
              onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchX === null || images.length < 2) return;
                const dx = e.changedTouches[0].clientX - touchX;
                if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
                setTouchX(null);
              }}
            >
              <Image
                key={images[safeIndex]}
                src={images[safeIndex]}
                alt={`${product.name}${colour ? `, ${colour.name}` : ""}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover object-center fade-in"
              />
              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge variant="gold">{product.badge}</Badge>
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-ink hover:bg-white">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => step(1)} aria-label="Next photo" className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-ink hover:bg-white">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 lg:hidden" aria-hidden>
                    {images.map((_, i) => (
                      <span key={i} className={cn("h-1.5 rounded-full transition-colors", i === safeIndex ? "w-4 bg-ink" : "w-1.5 bg-ink/30")} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 self-start">
            <p className="text-xs text-muted">{product.fabricType || product.department}</p>
            <h1 className="text-2xl sm:text-3xl text-ink mt-1 leading-snug">{product.name}</h1>

            <div className="mt-4 flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl font-medium text-ink tabular-nums">{formatPrice(currentPrice)}</span>
              {showMrp && <span className="text-base text-muted line-through tabular-nums">{formatPrice(product.mrp!)}</span>}
              {percentOff > 0 && <span className="text-sm font-medium text-emerald-800">{percentOff}% off</span>}
              {isFabric && product.pricePerMetre && !isFullThaan && (
                <span className="text-xs text-muted">({formatPrice(product.pricePerMetre)} per metre)</span>
              )}
            </div>
            <p className="text-xs text-muted mt-1">
              Inclusive of 5% GST{isFullThaan ? `, includes ${thaanDiscountPct}% savings on the full roll` : ""}
            </p>

            {/* Colour */}
            {colours.length > 0 && (
              <div className="mt-7">
                <p className="text-sm text-ink">
                  Colour: <span className="font-medium">{colour?.name}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-3" role="group" aria-label="Choose a colour">
                  {colours.map((c) => {
                    const on = c.name === colour?.name;
                    const out = !colourInStock(c.name);
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => chooseColour(c.name)}
                        aria-label={`${c.name}${out ? ", out of stock" : ""}`}
                        aria-pressed={on}
                        title={c.name}
                        className={cn(
                          "relative w-9 h-9 rounded-full ring-offset-2 ring-offset-white transition-shadow",
                          on ? "ring-2 ring-ink" : "hover:ring-2 hover:ring-ink/30",
                          isLightHex(c.hex) && "border border-black/15",
                          out && "opacity-40"
                        )}
                        style={{ backgroundColor: c.hex }}
                      >
                        {out && <span aria-hidden className="absolute inset-0 flex items-center justify-center"><span className="block w-full h-px bg-ink rotate-45" /></span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size */}
            {needsSize && (
              <div id="size-picker" className="mt-7">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-ink">
                    Size{size ? <>: <span className="font-medium">{size}</span></> : null}
                  </p>
                  {showMissing && missingSize && <p role="alert" className="text-xs text-danger">Choose a size to continue</p>}
                </div>
                <div key={nudge} className={cn("mt-3 flex flex-wrap gap-2", nudge > 0 && "ring-flash")} role="group" aria-label="Choose a size">
                  {sizes.map((s) => {
                    const stock = sizeStock(s);
                    const on = s === size;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={stock === 0}
                        onClick={() => {
                          setSize(s);
                          setShowMissing(false);
                          setQuantity(1);
                        }}
                        aria-pressed={on}
                        className={cn(
                          "press min-w-[56px] h-11 px-4 text-sm border",
                          on ? "bg-ink text-white border-ink" : "bg-white text-ink border-black/20 hover:border-ink",
                          stock === 0 && "opacity-40 line-through cursor-not-allowed hover:border-black/20"
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                {selectedVariant && selectedVariant.stockQty > 0 && selectedVariant.stockQty <= 3 && (
                  <p className="text-xs text-amber-ink mt-3">Only {selectedVariant.stockQty} left in this size and colour</p>
                )}
              </div>
            )}

            {/* Fabric by the metre */}
            {isFabric && (
              <div className="mt-7 border border-black/15 p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-sm text-ink">How much fabric</span>
                  <div className="flex gap-2">
                    {[false, true].map((thaan) => (
                      <button
                        key={String(thaan)}
                        type="button"
                        onClick={() => setIsFullThaan(thaan)}
                        className={cn(
                          "px-3 py-1.5 text-xs border transition-colors",
                          isFullThaan === thaan ? "bg-ink text-white border-ink" : "border-black/20 text-ink"
                        )}
                      >
                        {thaan ? "Full thaan (25 m)" : "Custom metres"}
                      </button>
                    ))}
                  </div>
                </div>
                {!isFullThaan ? (
                  <div>
                    <Stepper label="Length in metres (0.5 m steps)" value={metres} onChange={setMetres} min={1.0} max={50.0} step={0.5} unit="metres" large />
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {[1.5, 2.5, 3.5, 5.0].map((quick) => (
                        <button key={quick} type="button" onClick={() => setMetres(quick)} className="px-2.5 py-1 text-xs bg-fog border border-black/10 hover:border-ink text-ink">
                          {quick} m{quick === 1.5 ? " (blouse)" : quick === 2.5 ? " (kurta)" : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-graphite leading-relaxed">
                    A full 25 metre roll at a wholesale rate, suitable for boutiques and tailors.
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            {!isFabric && available && (
              <div className="mt-7">
                <Stepper label="Quantity" value={quantity} onChange={setQuantity} min={1} max={maxQty} />
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={!available}
              className="hidden sm:flex mt-8 w-full h-14 bg-ink hover:bg-wine text-white text-sm font-medium items-center justify-center gap-3 press disabled:opacity-50 disabled:hover:bg-ink"
            >
              <ShoppingBag className="w-4 h-4" />
              {ctaLabel}
            </button>

            {/* Information */}
            <div className="mt-8 border-t border-black/10">
              {[
                {
                  title: "Description",
                  body: <p className="whitespace-pre-line">{product.description}</p>,
                },
                {
                  title: "Fabric and care",
                  body: (
                    <dl className="grid grid-cols-[110px_1fr] gap-y-2">
                      <dt className="text-muted">Fabric</dt>
                      <dd>{product.fabricType || "—"}</dd>
                      {product.composition && (<><dt className="text-muted">Composition</dt><dd>{product.composition}</dd></>)}
                      {isFabric && (<><dt className="text-muted">Width</dt><dd>{product.width || "44 inches"}</dd></>)}
                      <dt className="text-muted">Care</dt>
                      <dd>{product.care || "Wash separately in cold water, dry in shade"}</dd>
                    </dl>
                  ),
                },
                {
                  title: "Delivery and exchange",
                  body: (
                    <ul className="space-y-2">
                      <li className="flex gap-2"><Truck className="w-4 h-4 shrink-0 mt-0.5" /> Dispatched in 1 to 2 working days</li>
                      <li className="flex gap-2"><ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" /> Quality checked before dispatch</li>
                      <li className="flex gap-2"><RotateCcw className="w-4 h-4 shrink-0 mt-0.5" /> Easy exchange on garments. Fabric cut to length is not returnable</li>
                    </ul>
                  ),
                },
              ].map((s, i) => (
                <details key={s.title} open={i === 0} className="group border-b border-black/10">
                  <summary className="flex items-center justify-between py-4 text-sm font-medium text-ink cursor-pointer list-none">
                    {s.title}
                    <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pb-5 text-sm text-graphite leading-relaxed">{s.body}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-black/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-3">
        <div className="shrink-0">
          <span className="block text-base font-medium tabular-nums text-ink">{formatPrice(currentPrice)}</span>
          {showMrp && <span className="block text-xs text-muted line-through tabular-nums">{formatPrice(product.mrp!)}</span>}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!available}
          className="press flex-1 h-12 bg-ink text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ShoppingBag className="w-4 h-4" />
          {added ? "Added to bag" : !available ? "Out of stock" : missingSize ? "Select a size" : "Add to bag"}
        </button>
      </div>
    </div>
  );
}
