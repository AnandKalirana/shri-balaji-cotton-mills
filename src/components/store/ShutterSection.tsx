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
}

const allDepartments: DepartmentData[] = [
  {
    id: "d1",
    name: "Fabrics",
    slug: "fabrics",
    headline: "Quality Fabrics by the Metre",
    subheadline: "Cotton, silk and blended fabrics, cut to the length you need.",
    accentQuote: "Soft, breathable and made to be stitched your way.",
  },
  {
    id: "d2",
    name: "Kurta Set",
    slug: "kurta-set",
    headline: "Ready-to-Wear Kurta Sets",
    subheadline: "Kurta, bottoms and dupatta together, in designs for every day and every festival.",
    accentQuote: "Put it on and you are ready to go.",
  },
  {
    id: "d3",
    name: "Kurti",
    slug: "kurti",
    headline: "Comfortable Everyday Kurtis",
    subheadline: "Easy cuts in soft cottons, from office days to weekend plans.",
    accentQuote: "Simple, comfortable and easy to style.",
  },
  {
    id: "d4",
    name: "Stretchy Blouse",
    slug: "stretchy-blouse",
    headline: "Stretchy Ready-Made Blouses",
    subheadline: "A comfortable, flexible fit that goes with all your sarees.",
    accentQuote: "No tailor visits, no fitting trouble.",
  },
  {
    id: "d5",
    name: "Saree Shapewear",
    slug: "saree-shapewear",
    headline: "Saree Shapewear",
    subheadline: "Smooth shaping that keeps your saree in place all day.",
    accentQuote: "Drape with confidence.",
  },
  {
    id: "d6",
    name: "Men's Wear",
    slug: "mens-wear",
    headline: "Men's T-Shirts & Shirts",
    subheadline: "Soft cotton T-shirts and shirts for work, weekends and everything between.",
    accentQuote: "Simple, comfortable and made to last.",
  },
];

/** `images` holds one real product photo per category slug. Categories without a photo are skipped. */
export function ShutterSection({ images }: { images: Record<string, string> }) {
  const departments = allDepartments.filter((d) => images[d.slug]);
  if (!departments.length) return null;
  return <Shutter departments={departments} images={images} />;
}

function Shutter({ departments, images }: { departments: DepartmentData[]; images: Record<string, string> }) {
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
      className="relative w-full h-[650px] sm:h-[720px] md:h-[800px] overflow-hidden bg-[#1a1a1a] text-white select-none"
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
          style={{ backgroundImage: `url(${images[activeDept.slug]})` }}
        >
          {/* Architectural Dark Scrim Overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Content Vitrine */}
      <div className="relative z-10 h-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col justify-between py-10 sm:py-16">
        {/* Top Header & Department Counter */}
        <div className="flex items-center justify-between border-b border-[#c5a880]/30 pb-4">
          <span className="text-xs sm:text-xs font-medium text-[#c5a880]">
            Shop by Category
          </span>
          <div className="flex items-center gap-4">
            <Link href="/collections" className="text-xs font-medium text-[#c5a880] hover:text-white transition-colors">
              View all categories
            </Link>
            <span className="text-xs tracking-widest text-[#d8c2bb]">
              0{currentIndex + 1} / 0{departments.length}
            </span>
          </div>
        </div>

        {/* Center Editorial Headlines */}
        <div className="max-w-2xl py-6">
          <p className="text-xs font-medium text-[#c5a880] mb-2 sm:mb-3">
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
              className="px-8 py-3.5 bg-white text-[#1a1a1a] text-sm font-medium hover:bg-[#1a1a1a] hover:text-white transition-colors border border-transparent min-h-[48px] flex items-center justify-center"
            >
              Explore Collection
            </Link>

            <span className="hidden sm:inline-block italic text-xs text-[#c5a880] border-l border-[#c5a880]/40 pl-4 py-1 max-w-xs">
              &ldquo;{activeDept.accentQuote}&rdquo;
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
                  "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors touch-target",
                  currentIndex === idx
                    ? "bg-[#c5a880] text-[#1a1a1a]"
                    : "text-[#d8c2bb] hover:text-white bg-white/10"
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
              className="w-12 h-12 rounded-full flex items-center justify-center border border-[#c5a880]/40 hover:border-[#c5a880] text-white hover:bg-white/10 transition-colors touch-target"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Department"
              className="w-12 h-12 rounded-full flex items-center justify-center border border-[#c5a880]/40 hover:border-[#c5a880] text-white hover:bg-white/10 transition-colors touch-target"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
