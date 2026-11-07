import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { HeroTone } from "@/components/store/HeroTone";
import { ShutterSection } from "@/components/store/ShutterSection";
import { ProductCard } from "@/components/store/ProductCard";
import { getProducts, getActiveBanner } from "@/lib/catalog";
import { DEFAULT_HERO } from "@/lib/hero";
import { ArrowRight, Check, MessageCircle, Shield, Compass, Truck } from "lucide-react";

export default async function HomePage() {
  const [{ products }, banner] = await Promise.all([getProducts(), getActiveBanner()]);
  const hero = banner
    ? {
        eyebrow: banner.eyebrow ?? "",
        title: banner.title,
        subtitle: banner.subtitle ?? "",
        ctaText: banner.ctaText,
        ctaLink: banner.ctaLink,
        desktopImg: banner.desktopImg,
        mobileImg: banner.mobileImg,
        imageOnly: Boolean((banner as { imageOnly?: boolean }).imageOnly),
      }
    : DEFAULT_HERO;
  const heroLines = hero.title.split("\n");
  const featuredProducts = products.slice(0, 4);
  const fabricProducts = products.filter((p) => p.pricePerMetre).slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* 1. Hero Showcase */}
      <HeroTone light={hero.imageOnly} />
      {hero.imageOnly ? (
        <section>
          <h1 className="sr-only">{heroLines.join(" ")}</h1>
          <div className="relative w-full bg-[#f8f3ea]">
            <Image
              src={hero.desktopImg}
              alt=""
              width={1500}
              height={600}
              priority
              sizes="100vw"
              className={`w-full h-auto min-h-[220px] object-cover ${hero.mobileImg !== hero.desktopImg ? "hidden md:block" : ""}`}
            />
            {hero.mobileImg !== hero.desktopImg && (
              <Image
                src={hero.mobileImg}
                alt=""
                width={800}
                height={1000}
                priority
                sizes="100vw"
                className="w-full h-auto md:hidden"
              />
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4 py-6">
            <Link
              href={hero.ctaLink}
              className="w-full sm:w-auto sm:min-w-[200px] px-8 py-3 bg-[#1a1a1a] text-white text-sm font-medium hover:bg-[#5c1d24] transition-colors min-h-[48px] flex items-center justify-center"
            >
              {hero.ctaText}
            </Link>
            <Link
              href="/category/fabrics"
              className="w-full sm:w-auto sm:min-w-[200px] px-8 py-3 border border-[#1a1a1a] text-[#1a1a1a] text-sm font-medium hover:bg-[#1a1a1a] hover:text-white transition-colors min-h-[48px] flex items-center justify-center"
            >
              Order fabric by the metre
            </Link>
          </div>
        </section>
      ) : (
      <>
      <section className="relative min-h-[560px] sm:min-h-[640px] lg:min-h-[720px] flex items-center justify-center bg-[#d9d5cf] text-white overflow-hidden">
        {/* Full-bleed photo */}
        <div className="absolute inset-0 z-0">
          <Image
            src={hero.desktopImg}
            alt=""
            fill
            priority
            sizes="100vw"
            className={`object-cover object-center ${hero.mobileImg !== hero.desktopImg ? "hidden md:block" : ""}`}
          />
          {hero.mobileImg !== hero.desktopImg && (
            <Image
              src={hero.mobileImg}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center md:hidden"
            />
          )}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Hero Content */}
        <Reveal y={16} className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center py-16 sm:py-24">
          {hero.eyebrow.trim() && (
            <p className="text-xs sm:text-sm font-medium text-white mb-3">{hero.eyebrow}</p>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl text-white leading-[1.1] mb-5">
            {heroLines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br className="hidden sm:block" />}
                {i > 0 && <span className="sm:hidden"> </span>}
                {line}
              </span>
            ))}
          </h1>

          <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed mb-8">
            {hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={hero.ctaLink}
              className="w-full sm:w-auto sm:min-w-[200px] px-8 py-3 bg-white text-[#1a1a1a] text-sm font-medium hover:bg-[#1a1a1a] hover:text-white transition-colors min-h-[48px] flex items-center justify-center"
            >
              {hero.ctaText}
            </Link>

            <Link
              href="/category/fabrics"
              className="w-full sm:w-auto sm:min-w-[200px] px-8 py-3 bg-white text-[#1a1a1a] text-sm font-medium hover:bg-[#1a1a1a] hover:text-white transition-colors min-h-[48px] flex items-center justify-center"
            >
              Order fabric by the metre
            </Link>
          </div>
        </Reveal>
      </section>
      </>
      )}

      {/* 2. Signature Upward Shutter Section */}
      <ShutterSection />

      {/* 3. Featured Masterpieces Grid */}
      <section className="py-16 sm:py-24 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14 pb-2">
          <div>
            <span className="text-xs sm:text-xs font-medium text-[#5c1d24]">
              Handpicked for You
            </span>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-4xl font-normal text-[#1a1a1a] mt-1">
              Featured Products
            </h2>
          </div>

          <Link
            href="/category/fabrics"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#5c1d24] hover:text-[#1a1a1a] transition-colors"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Responsive Grid: 1 col (360-430px) -> 2 col (sm/md) -> 4 col (lg/xl) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {featuredProducts.map((product, index) => (
            <Reveal key={product.id} delay={index * 0.1}>
              <ProductCard product={product} priority={index === 0} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* 4. Fabric by the Metre Highlight (Dual Inventory Banner) */}
      <section className="bg-[#f5f5f3] py-16 sm:py-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Text column */}
            <div className="lg:col-span-5">
              <span className="text-xs font-medium text-[#5c1d24]">
                Fabric by the Metre
              </span>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-normal text-[#1a1a1a] mt-2 mb-4 leading-tight">
                Order by the Metre or Complete Thaan
              </h2>
              <p className="text-sm sm:text-base text-[#444444] leading-relaxed mb-6">
                Order fabric in cuts as small as 0.5m. Boutiques and tailors can also order full rolls (thaans) of 25m or 50m at wholesale rates.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-[#1a1a1a]">
                  <span className="w-5 h-5 bg-[#5c1d24] text-white flex items-center justify-center rounded-none"><Check size={14} strokeWidth={1.5} /></span>
                  <span>Cut to length from 0.5 metre, with a neat pinked edge</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-[#1a1a1a]">
                  <span className="w-5 h-5 bg-[#5c1d24] text-white flex items-center justify-center rounded-none"><Check size={14} strokeWidth={1.5} /></span>
                  <span>Automatic 12% savings on uncut standard thaan bolts (25m)</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-[#1a1a1a]">
                  <span className="w-5 h-5 bg-[#5c1d24] text-white flex items-center justify-center rounded-none"><Check size={14} strokeWidth={1.5} /></span>
                  <span>Quality-checked fabric, cut fresh for every order</span>
                </div>
              </div>

              <Link
                href="/category/fabrics"
                className="inline-flex px-8 py-3.5 bg-[#1a1a1a] text-white text-xs font-medium hover:bg-[#5c1d24] transition-colors min-h-[48px] items-center justify-center"
              >
                Browse Fabrics by Metre
              </Link>
            </div>

            {/* Product vitrines */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {fabricProducts.slice(0, 2).map((product, index) => (
                <Reveal key={product.id} delay={index * 0.12}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Trust & Heritage Pillars */}
      <section className="py-14 sm:py-16 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-6 h-6 shrink-0 flex items-center justify-center text-[#1a1a1a]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#1a1a1a]">Quality You Can Trust</h4>
              <p className="text-xs text-[#6f6f6f] mt-1">Carefully checked cotton, silk and stretch fabrics in every order.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-6 h-6 shrink-0 flex items-center justify-center text-[#1a1a1a]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#1a1a1a]">Pan-India Delivery</h4>
              <p className="text-xs text-[#6f6f6f] mt-1">Free delivery above ₹2,000 via trusted couriers with live tracking.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-6 h-6 shrink-0 flex items-center justify-center text-[#1a1a1a]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#1a1a1a]">Cut to Your Length</h4>
              <p className="text-xs text-[#6f6f6f] mt-1">Order the exact metres you need for kurtas, blouses or suits.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-6 h-6 shrink-0 flex items-center justify-center text-[#1a1a1a]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#1a1a1a]">WhatsApp Support</h4>
              <p className="text-xs text-[#6f6f6f] mt-1">Ask us about sizes, fabrics and orders on WhatsApp.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

