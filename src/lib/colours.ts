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
  offwhite: "#f3efe6",
  ivory: "#f6f1e3",
  silver: "#c0c0c0",
  limegreen: "#9acd32",
  lime: "#9acd32",
  pear: "#c9d36a",
  nude: "#e3bc9a",
  seaweed: "#2f5d50",
  pista: "#a8c686",
  pistachio: "#a8c686",
  bloodred: "#8a0303",
  rosepink: "#ec7d9a",
  taffy: "#f4a6b8",
  peacockblue: "#00758f",
  tealblue: "#1e7c8a",
  teal: "#1e7c8a",
  burgundy: "#800020",
  fuchsiapink: "#d6246e",
  mauve: "#b784a7",
  lavender: "#b9a7e0",
  lilac: "#c8a2c8",
  turquoise: "#2ab7ca",
  rust: "#b7410e",
  tan: "#c19a6b",
  khaki: "#c3b091",
  charcoal: "#36454f",
  magenta: "#c2185b",
  violet: "#7e57c2",
  copper: "#b87333",
  mint: "#a8e0c5",
  lemon: "#f7e463",
  coral: "#f2735f",
  salmon: "#f4978e",
  babypink: "#f6c6d1",
  ltpink: "#f8c8d4",
  dkpink: "#c2185b",
};

/** Names with no single colour. These show as two-tone swatches. */
const PRINTS: Record<string, [string, string]> = {
  floralprint: ["#e57399", "#6aa84f"],
  print: ["#b0b0ae", "#e0e0de"],
  multi: ["#e57399", "#2e7d32"],
  multicolour: ["#e57399", "#2e7d32"],
  multicolor: ["#e57399", "#2e7d32"],
};

export const NEUTRAL_SWATCH = "#d9d9d6";

const key = (name: string) => name.toLowerCase().replace(/[^a-z]/g, "");

function mix(hex: string, towards: "#ffffff" | "#000000", amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const t = parseInt(towards.slice(1), 16);
  const ch = (shift: number) => {
    const from = (n >> shift) & 255;
    const to = (t >> shift) & 255;
    return Math.round(from + (to - from) * amount);
  };
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}

/** One colour word or phrase: exact name, then "light"/"dark" shades of a known colour. */
function singleHex(name: string): string | null {
  const k = key(name);
  if (!k) return null;
  if (HEX[k]) return HEX[k];
  if (HEX[k.replace(/^(dark|dk)/, "dk")]) return HEX[k.replace(/^(dark|dk)/, "dk")];
  const light = k.match(/^(light|lt|pale|baby)(.+)$/);
  if (light && HEX[light[2]]) return mix(HEX[light[2]], "#ffffff", 0.4);
  const dark = k.match(/^(dark|dk|deep)(.+)$/);
  if (dark && HEX[dark[2]]) return mix(HEX[dark[2]], "#000000", 0.35);
  return null;
}

/**
 * A swatch for a colour name. A plain colour gives a hex like "#c62828".
 * A two-colour name like "Purple & White" gives a split swatch (a CSS gradient), the first colour on the left.
 * Returns null when the name isn't one we know.
 */
export function colourHex(name: string): string | null {
  const direct = singleHex(name);
  if (direct) return direct;
  const print = PRINTS[key(name)];
  if (print) return `linear-gradient(135deg, ${print[0]} 50%, ${print[1]} 50%)`;
  const parts = name.split(/\s*(?:&|\band\b|\/|\+|,)\s*/i).map((x) => x.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const first = singleHex(parts[0]);
    const second = singleHex(parts[1]);
    if (first && second) return `linear-gradient(135deg, ${first} 50%, ${second} 50%)`;
    if (first) return first;
  }
  return null;
}

/** The main plain colour of a swatch (the first colour of a two-tone one). */
export function mainHex(swatch: string): string {
  return swatch.match(/#[0-9a-f]{6}/i)?.[0] ?? NEUTRAL_SWATCH;
}

/** Text colour that reads well on a button of this colour. */
export function readableOn(swatch: string): "#ffffff" | "#1a1a1a" {
  const n = parseInt(mainHex(swatch).slice(1), 16);
  const lin = (c: number) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  const lum = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  // Dark text wins when the colour is light enough that white would contrast poorly.
  return lum > 0.35 ? "#1a1a1a" : "#ffffff";
}

/** True for light swatches that need a visible border. */
export function isLightHex(swatch: string): boolean {
  const all = swatch.match(/#[0-9a-f]{6}/gi) ?? [NEUTRAL_SWATCH];
  return all.some((h) => {
    const n = parseInt(h.slice(1), 16);
    return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 200;
  });
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
