import Link from "next/link";
import Image from "next/image";
import { ShutterSection } from "@/components/store/ShutterSection";
import { ProductCard } from "@/components/store/ProductCard";
import { products, categories } from "@/lib/data";
import { ArrowRight, Sparkles, Shield, Compass, Truck } from "lucide-react";

export default function HomePage() {
  const featuredProducts = products.slice(0, 4);
  const fabricProducts = products.filter((p) => p.pricePerMetre).slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* 1. Hero Showcase */}
      <section className="relative min-h-[580px] sm:min-h-[680px] lg:min-h-[780px] flex items-center justify-center bg-[#2b1e1a] text-white overflow-hidden">
        {/* Background Editorial Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920"
            alt="Varanasi Gold Zari Loom"
            fill
            priority
            className="object-cover object-center opacity-45 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2b1e1a] via-[#2b1e1a]/60 to-[#2b1e1a]/20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-16 sm:py-24">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#c5a880]/20 border border-[#c5a880]/50 text-[#c5a880] text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Shri Balaji Cotton Mills</span>
          </span>

          <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-7xl font-normal text-[#faf7f2] tracking-tight leading-[1.1] mb-6">
            Ancient Weaves. <br className="hidden sm:block" />
            Architectural Luxury.
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#d8c2bb] font-normal max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10">
            Curating India's finest Banarasi brocades, pure Katan silks, and artisanal handloom yardage directly from the master looms of Varanasi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/category/silk-sarees"
              className="w-full sm:w-auto px-8 py-4 bg-[#5c1d24] text-white text-xs tracking-[0.16em] uppercase font-semibold hover:bg-white hover:text-[#2b1e1a] transition-all min-h-[50px] flex items-center justify-center border border-transparent shadow-lg"
            >
              Explore Silk Sarees
            </Link>

            <Link
              href="/category/handloom-fabrics"
              className="w-full sm:w-auto px-8 py-4 bg-transparent text-[#faf7f2] text-xs tracking-[0.16em] uppercase font-semibold border border-[#c5a880] hover:bg-[#faf7f2] hover:text-[#2b1e1a] transition-all min-h-[50px] flex items-center justify-center"
            >
              Order Fabric by Metre
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Signature Upward Shutter Section */}
      <ShutterSection />

      {/* 3. Featured Masterpieces Grid */}
      <section className="py-16 sm:py-24 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14 border-b border-[#ebe3d5] pb-6">
          <div>
            <span className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-semibold text-[#5c1d24]">
              Curated Selection
            </span>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-4xl font-normal text-[#2b1e1a] mt-1">
              Atelier Masterpieces
            </h2>
          </div>

          <Link
            href="/category/silk-sarees"
            className="inline-flex items-center gap-2 text-xs tracking-[0.12em] uppercase font-semibold text-[#5c1d24] hover:text-[#2b1e1a] transition-colors"
          >
            <span>View All Weaves</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Responsive Grid: 1 col (360-430px) -> 2 col (sm/md) -> 4 col (lg/xl) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index === 0} />
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
                Custom Couture Yardage
              </span>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-normal text-[#2b1e1a] mt-2 mb-4 leading-tight">
                Order by the Metre or Complete Thaan
              </h2>
              <p className="text-sm sm:text-base text-[#534343] leading-relaxed mb-6">
                Tailor your vision with precision cuts down to 0.5m. Boutiques and designers can also order intact rolls (thaans) of 25m or 50m with exclusive wholesale tier benefits.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-[#2b1e1a]">
                  <span className="w-5 h-5 bg-[#5c1d24] text-white flex items-center justify-center rounded-none text-xs font-bold">✓</span>
                  <span>Fractional 0.5-metre precision cut with pinking shear finish</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-[#2b1e1a]">
                  <span className="w-5 h-5 bg-[#5c1d24] text-white flex items-center justify-center rounded-none text-xs font-bold">✓</span>
                  <span>Automatic 12% savings on uncut standard thaan bolts (25m)</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-[#2b1e1a]">
                  <span className="w-5 h-5 bg-[#5c1d24] text-white flex items-center justify-center rounded-none text-xs font-bold">✓</span>
                  <span>Silk Mark certified handloom purity guarantee</span>
                </div>
              </div>

              <Link
                href="/category/handloom-fabrics"
                className="inline-flex px-8 py-3.5 bg-[#2b1e1a] text-white text-xs tracking-[0.14em] uppercase font-semibold hover:bg-[#5c1d24] transition-colors min-h-[48px] items-center justify-center"
              >
                Browse Fabrics by Metre
              </Link>
            </div>

            {/* Product vitrines */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {fabricProducts.slice(0, 2).map((product) => (
                <ProductCard key={product.id} product={product} />
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
              <h4 className="font-semibold text-sm text-[#2b1e1a]">Authentic Handloom</h4>
              <p className="text-xs text-[#867273] mt-1">100% verified artisan silk with genuine zari threadwork.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 shrink-0 bg-[#f0ede9] border border-[#c5a880] flex items-center justify-center text-[#5c1d24]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#2b1e1a]">Insured Pan-India Transit</h4>
              <p className="text-xs text-[#867273] mt-1">Free delivery above ₹2,000 via trusted couriers with live tracking.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 shrink-0 bg-[#f0ede9] border border-[#c5a880] flex items-center justify-center text-[#5c1d24]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#2b1e1a]">Bespoke Metre Cuts</h4>
              <p className="text-xs text-[#867273] mt-1">Order exact yardage needed for blouses, lehengas or kurtas.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 shrink-0 bg-[#f0ede9] border border-[#c5a880] flex items-center justify-center text-[#5c1d24]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#2b1e1a]">Atelier Concierge</h4>
              <p className="text-xs text-[#867273] mt-1">Expert stylists available on WhatsApp for custom consultation.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

