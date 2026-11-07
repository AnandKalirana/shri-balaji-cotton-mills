/** Helpers for turning lists of colours and sizes into the variants a product sells. */

export interface Combo {
  colour: string;
  size: string;
}

/** Every colour and size pairing. With no colours or no sizes, the missing side is left blank. */
export function combos(colours: string[], sizes: string[]): Combo[] {
  const cs = colours.length ? colours : [""];
  const ss = sizes.length ? sizes : [""];
  return cs.flatMap((colour) => ss.map((size) => ({ colour, size })));
}

const clean = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]+/g, "");

/** A stock code such as SBCM-101-RED-XL. */
export function variantSku(base: string, colour: string, size: string): string {
  return ["SBCM", clean(base), clean(colour), clean(size)].filter(Boolean).join("-").slice(0, 60);
}
