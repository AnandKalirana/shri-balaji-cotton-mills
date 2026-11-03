import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { ShutterSection } from "@/components/store/ShutterSection";
import { ProductCard } from "@/components/store/ProductCard";
import { getProducts, getActiveBanner } from "@/lib/catalog";
import { DEFAULT_HERO } from "@/lib/hero";
import { ArrowRight, MessageCircle, Shield, Compass, Truck } from "lucide-react";

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
      }
    : DEFAULT_HERO;
  const heroLines = hero.title.split("\n");
  const featuredProducts = products.slice(0, 4);
  const fabricProducts = products.filter((p) => p.pricePerMetre).slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* 1. Hero Showcase */}
      <section className="relative min-h-[580px] sm:min-h-[680px] lg:min-h-[780px] flex items-center justify-center bg-[#2b1e1a] text-white overflow-hidden">
        {/* Background Editorial Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={hero.desktopImg}
            alt=""
            fill
            priority
            sizes="100vw"
            className={`object-cover object-center opacity-45 scale-105 ${hero.mobileImg !== hero.desktopImg ? "hidden md:block" : ""}`}
          />
          {hero.mobileImg !== hero.desktopImg && (
            <Image
              src={hero.mobileImg}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-45 scale-105 md:hidden"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2b1e1a] via-[#2b1e1a]/70 to-[#2b1e1a]/35" />
        </div>

        {/* Hero Content */}
        <Reveal y={32} className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-16 sm:py-24">
          {hero.eyebrow.trim() && (
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/25 text-[#f0dcb8] text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-semibold mb-6">
              {hero.eyebrow}
            </span>
          )}

          <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-7xl font-normal text-[#faf7f2] tracking-tight leading-[1.1] mb-6">
            {heroLines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br className="hidden sm:block" />}
                {i > 0 && <span className="sm:hidden"> </span>}
                {line}
              </span>
            ))}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#f3e8e3] font-normal max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10">
            {hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={hero.ctaLink}
              className="w-full sm:w-auto sm:min-w-[240px] px-8 py-4 rounded-full bg-[#5c1d24] text-white text-xs tracking-[0.16em] uppercase font-semibold hover:bg-white hover:text-[#2b1e1a] active:scale-[0.98] transition-all min-h-[52px] flex items-center justify-center border border-transparent shadow-[0_10px_30px_-10px_rgba(92,29,36,0.8)]"
            >
              {hero.ctaText}
            </Link>

            <Link
              href="/category/fabrics"
              className="w-full sm:w-auto sm:min-w-[240px] px-8 py-4 rounded-full bg-white/10 backdrop-blur-md text-[#faf7f2] text-xs tracking-[0.16em] uppercase font-semibold border border-white/30 hover:bg-[#faf7f2] hover:text-[#2b1e1a] active:scale-[0.98] transition-all min-h-[52px] flex items-center justify-center"
            >
              Order Fabric by Metre
            </Link>
          </div>
        </Reveal>

        {/* Scroll cue */}
        <div aria-hidden className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/60">
          <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
          <span className="block w-px h-8 bg-gradient-to-b from-white/60 to-transparent" />
        </div>
      </section>

      {/* 2. Signature Upward Shutter Section */}
      <ShutterSection />

      {/* 3. Featured Masterpieces Grid */}
      <section className="py-16 sm:py-24 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14 border-b border-[#ebe3d5] pb-6">
          <div>
            <span className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-semibold text-[#5c1d24]">
              Handpicked for You
            </span>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-4xl font-normal text-[#2b1e1a] mt-1">
              Featured Products
            </h2>
          </div>

          <Link
            href="/category/fabrics"
            className="inline-flex items-center gap-2 text-xs tracking-[0.12em] uppercase font-semibold text-[#5c1d24] hover:text-[#2b1e1a] transition-colors"
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
      <section className="bg-[#f0ede9] border-y border-[#ebe3d5] py-16 sm:py-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Text column */}
            <div className="lg:col-span-5">
              <span className="text-[11px] tracking-[0.18em] uppercase font-semibold text-[#5c1d24]">
                Fabric by the Metre
              </span>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-normal text-[#2b1e1a] mt-2 mb-4 leading-tight">
                Order by the Metre or Complete Thaan
              </h2>
              <p className="text-sm sm:text-base text-[#534343] leading-relaxed mb-6">
                Order fabric in cuts as small as 0.5m. Boutiques and tailors can also order full rolls (thaans) of 25m or 50m at wholesale rates.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-[#2b1e1a]">
                  <span className="w-5 h-5 bg-[#5c1d24] text-white flex items-center justify-center rounded-none text-xs font-bold">✓</span>
                  <span>Cut to length from 0.5 metre, with a neat pinked edge</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-[#2b1e1a]">
                  <span className="w-5 h-5 bg-[#5c1d24] text-white flex items-center justify-center rounded-none text-xs font-bold">✓</span>
                  <span>Automatic 12% savings on uncut standard thaan bolts (25m)</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-[#2b1e1a]">
                  <span className="w-5 h-5 bg-[#5c1d24] text-white flex items-center justify-center rounded-none text-xs font-bold">✓</span>
                  <span>Quality-checked fabric, cut fresh for every order</span>
                </div>
              </div>

              <Link
                href="/category/fabrics"
                className="inline-flex px-8 py-3.5 rounded-full bg-[#2b1e1a] text-white text-xs tracking-[0.14em] uppercase font-semibold hover:bg-[#5c1d24] transition-colors min-h-[48px] items-center justify-center"
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
      <section className="py-14 sm:py-16 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 border-b border-[#ebe3d5]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 shrink-0 bg-[#f0ede9] border border-[#c5a880] flex items-center justify-center text-[#5c1d24]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#2b1e1a]">Quality You Can Trust</h4>
              <p className="text-xs text-[#867273] mt-1">Carefully checked cotton, silk and stretch fabrics in every order.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 shrink-0 bg-[#f0ede9] border border-[#c5a880] flex items-center justify-center text-[#5c1d24]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#2b1e1a]">Pan-India Delivery</h4>
              <p className="text-xs text-[#867273] mt-1">Free delivery above ₹2,000 via trusted couriers with live tracking.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 shrink-0 bg-[#f0ede9] border border-[#c5a880] flex items-center justify-center text-[#5c1d24]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#2b1e1a]">Cut to Your Length</h4>
              <p className="text-xs text-[#867273] mt-1">Order the exact metres you need for kurtas, blouses or suits.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 shrink-0 bg-[#f0ede9] border border-[#c5a880] flex items-center justify-center text-[#5c1d24]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#2b1e1a]">WhatsApp Support</h4>
              <p className="text-xs text-[#867273] mt-1">Ask us about sizes, fabrics and orders on WhatsApp.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

