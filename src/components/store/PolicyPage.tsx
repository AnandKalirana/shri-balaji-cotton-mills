import type { ReactNode } from "react";
import { POLICY } from "@/lib/policies";

export function PolicyPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-medium text-[#1a1a1a]">{title}</h1>
      <p className="mt-2 text-xs text-[#6f6f6f]">Last updated: {POLICY.lastUpdated}</p>
      {intro && <p className="mt-6 text-sm leading-relaxed text-[#444444]">{intro}</p>}
      <div className="mt-8 space-y-8 text-sm leading-relaxed text-[#444444]">{children}</div>
    </div>
  );
}

export function PolicySection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-[#1a1a1a]">{heading}</h2>
      {children}
    </section>
  );
}

export function PolicyList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
