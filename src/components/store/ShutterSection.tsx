"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DepartmentData {
  id: string;
  name: string;
  slug: string;
  headline: string;
  subheadline: string;
  accentQuote: string;
  bgImage: string;
}

const departments: DepartmentData[] = [
  {
    id: "d1",
    name: "Silk Sarees",
    slug: "silk-sarees",
    headline: "Varanasi Heritage Katan & Zari",
    subheadline: "Hand-spun mulberry silk drapes with hand-beaten gold and silver filaments.",
    accentQuote: "Where royal courts once held audience, our master weavers preserve the loom.",
    bgImage: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1920",
  },
  {
    id: "d2",
    name: "Banarasi Brocade",
    slug: "banarasi-brocade",
    headline: "Architectural Meenakari Brocades",
    subheadline: "Intricate floral buta and jall patterns woven with architectural discipline.",
    accentQuote: "Each metre represents over eighty hours of deliberate shuttle choreography.",
    bgImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920",
  },
  {
    id: "d3",
    name: "Handloom Fabrics",
    slug: "handloom-fabrics",
    headline: "Pure Tussar & Hand-spun Cottons",
    subheadline: "Sold by the fractional metre for tailored silhouettes, kurtas, and luxury ensembles.",
    accentQuote: "Untreated raw textures that breathe with organic grace and natural luster.",
    bgImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920",
  },
  {
    id: "d4",
    name: "Bridal Collection",
    slug: "bridal-collection",
    headline: "Bespoke Bridal Sets & Lehengas",
    subheadline: "Complete heirloom trousseau fabrics, dupattas, and handcrafted lehenga panels.",
    accentQuote: "Heirloom textiles crafted to pass down across generations with timeless reverence.",
    bgImage: "https://images.unsplash.com/photo-1519657831219-0571f74f3c3c?w=1920",
  },
];

export function ShutterSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  const activeDept = departments[currentIndex];

  const handleNext = () => {
    setDirection("up");
    setCurrentIndex((prev) => (prev + 1) % departments.length);
  };

  const handlePrev = () => {
    setDirection("down");
    setCurrentIndex((prev) => (prev - 1 + departments.length) % departments.length);
  };

  // Safe gesture swipe with strict threshold guard (>100px) so normal scroll is not hijacked
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;

    if (Math.abs(deltaY) > 100) {
      if (deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartY.current = null;
  };

  return (
    <section
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Department Showcase Shutter"
      className="relative w-full h-[650px] sm:h-[720px] md:h-[800px] overflow-hidden bg-[#2b1e1a] text-white select-none"
    >
      {/* Background Slides with AnimatePresence */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={activeDept.id}
          custom={direction}
          initial={
            prefersReduced
              ? { opacity: 0 }
              : { y: direction === "up" ? "100%" : "-100%", opacity: 0.85 }
          }
          animate={{
            y: 0,
            opacity: 1,
            transition: { duration: 0.65, ease: "easeInOut" },
          }}
          exit={
            prefersReduced
              ? { opacity: 0 }
              : {
                  y: direction === "up" ? "-100%" : "100%",
                  opacity: 0.5,
                  transition: { duration: 0.65, ease: "easeInOut" },
                }
          }
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${activeDept.bgImage})` }}
        >
          {/* Architectural Dark Scrim Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2b1e1a] via-[#2b1e1a]/65 to-[#2b1e1a]/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content Vitrine */}
      <div className="relative z-10 h-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col justify-between py-10 sm:py-16">
        {/* Top Header & Department Counter */}
        <div className="flex items-center justify-between border-b border-[#c5a880]/30 pb-4">
          <span className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-semibold text-[#c5a880]">
            Curated Department Salon
          </span>
          <span className="text-xs tracking-widest text-[#d8c2bb]">
            0{currentIndex + 1} / 0{departments.length}
          </span>
        </div>

        {/* Center Editorial Headlines */}
        <div className="max-w-2xl py-6">
          <p className="text-[11px] tracking-[0.18em] uppercase font-semibold text-[#c5a880] mb-2 sm:mb-3">
            {activeDept.name}
          </p>

          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-6xl font-normal tracking-tight text-[#faf7f2] leading-[1.15] mb-4 sm:mb-6">
            {activeDept.headline}
          </h2>

          <p className="text-sm sm:text-base text-[#d8c2bb] font-normal leading-relaxed mb-6 sm:mb-8 max-w-xl">
            {activeDept.subheadline}
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href={`/category/${activeDept.slug}`}
              className="px-8 py-3.5 bg-[#5c1d24] text-white text-xs tracking-[0.14em] uppercase font-semibold hover:bg-white hover:text-[#2b1e1a] transition-colors border border-transparent min-h-[48px] flex items-center justify-center"
            >
              Explore Collection
            </Link>

            <span className="hidden sm:inline-block italic text-xs text-[#c5a880] border-l border-[#c5a880]/40 pl-4 py-1 max-w-xs">
              "{activeDept.accentQuote}"
            </span>
          </div>
        </div>

        {/* Bottom Shutter Controls & Accessible Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-[#c5a880]/30">
          {/* Accessible Category Pills */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
            {departments.map((dept, idx) => (
              <button
                key={dept.id}
                onClick={() => {
                  setDirection(idx > currentIndex ? "up" : "down");
                  setCurrentIndex(idx);
                }}
                className={cn(
                  "px-3 py-1.5 text-[10px] tracking-wider uppercase font-semibold whitespace-nowrap transition-colors touch-target",
                  currentIndex === idx
                    ? "bg-[#c5a880] text-[#2b1e1a]"
                    : "text-[#d8c2bb] hover:text-white bg-white/5"
                )}
              >
                {dept.name}
              </button>
            ))}
          </div>

          {/* Explicit Upward / Downward Shutter Transition Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrev}
              aria-label="Previous Department"
              className="w-12 h-12 flex items-center justify-center border border-[#c5a880]/40 hover:border-[#c5a880] text-white hover:bg-white/10 transition-colors touch-target"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Department"
              className="w-12 h-12 flex items-center justify-center border border-[#c5a880]/40 hover:border-[#c5a880] text-white hover:bg-white/10 transition-colors touch-target"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
