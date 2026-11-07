"use client";
import { useEffect } from "react";

/**
 * Tells the header that the picture behind it is light, so the logo and links stay dark
 * while the header sits on top of the hero.
 */
export function HeroTone({ light }: { light: boolean }) {
  useEffect(() => {
    const root = document.documentElement;
    if (light) root.dataset.heroTone = "light";
    else delete root.dataset.heroTone;
    window.dispatchEvent(new Event("hero-tone"));
    return () => {
      delete root.dataset.heroTone;
      window.dispatchEvent(new Event("hero-tone"));
    };
  }, [light]);
  return null;
}
