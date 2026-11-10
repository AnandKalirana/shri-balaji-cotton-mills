"use client";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

/** Fades and lifts content into view once as it scrolls into the viewport. */
export function Reveal({ children, delay = 0, y = 24, className }: RevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
