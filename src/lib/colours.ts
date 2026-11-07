/**
 * Swatch colours for the colour names used in the catalogue. These are best guesses for the
 * short names in the spreadsheet (for example "Dk.Chiku" or "Rani"). The owner can correct
 * any swatch in Admin > Products > Sizes and colours.
 */
const HEX: Record<string, string> = {
  red: "#c62828",
  black: "#141414",
  white: "#f7f7f5",
  maroon: "#6d1a22",
  rmaroon: "#7b1e2b",
  wine: "#722f37",
  fuschia: "#c2185b",
  fuchsia: "#c2185b",
  rani: "#d81b60",
  pink: "#f06292",
  vpink: "#e91e63",
  peach: "#f4b393",
  ltpeach: "#f8d2b8",
  skin: "#e8c3a4",
  yellow: "#f2c94c",
  ymustard: "#d4a017",
  mustard: "#d4a017",
  butter: "#f6e58d",
  onion: "#c97a8f",
  coffee: "#6f4e37",
  chiku: "#a1724e",
  dkchiku: "#7d5636",
  brown: "#6b4a34",
  green: "#2e7d32",
  dkgreen: "#1b5e20",
  pgreen: "#3a9d23",
  ramagreen: "#1b8a7a",
  olivegreen: "#6b7d2c",
  olive: "#6b7d2c",
  blue: "#1e63b5",
  nblue: "#1f2a5c",
  navy: "#1f2a5c",
  navyblue: "#1f2a5c",
  skyblue: "#7fb7e6",
  skygrey: "#a9b7c6",
  grey: "#8a8a88",
  gray: "#8a8a88",
  ltgrey: "#c8c8c6",
  purple: "#6a3d9a",
  orange: "#ef6c00",
  gold: "#c5a880",
  cream: "#f1e6cf",
  beige: "#d8c3a5",
};

export const NEUTRAL_SWATCH = "#d9d9d6";

const key = (name: string) => name.toLowerCase().replace(/[^a-z]/g, "");

/** A swatch colour for a colour name, or null when the name isn't one we know. */
export function colourHex(name: string): string | null {
  const k = key(name);
  return HEX[k] ?? HEX[k.replace(/^(dark|dk)/, "dk")] ?? null;
}

/** True for light swatches that need a visible border. */
export function isLightHex(hex: string): boolean {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 200;
}

const SIZE_ORDER = ["xxs", "xs", "s", "m", "l", "xl", "xxl", "2xl", "3xl", "xxxl", "4xl", "5xl", "free", "freesize"];

/** Sorts sizes the way shoppers expect: S, M, L, XL, XXL; unknown sizes keep their order after. */
export function sortSizes(sizes: string[]): string[] {
  const rank = (s: string) => {
    const i = SIZE_ORDER.indexOf(s.toLowerCase().replace(/[^a-z0-9]/g, ""));
    return i === -1 ? 1000 : i;
  };
  return [...sizes].sort((a, b) => rank(a) - rank(b));
}
