/**
 * A link where the customer can follow their parcel.
 * - If the owner pasted a full web address as the tracking number, that address is used (http or https only).
 * - Delhivery and Blue Dart open their own tracking page for the number.
 * - Any other courier opens a search for "<courier> tracking <number>", which always lands somewhere useful.
 */
export function trackingLink(courier: string | null | undefined, tracking: string | null | undefined): string | null {
  const t = (tracking ?? "").trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) {
    try {
      const u = new URL(t);
      return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
    } catch {
      return null;
    }
  }
  const c = (courier ?? "").toLowerCase();
  const n = encodeURIComponent(t);
  if (c.includes("delhivery")) return `https://www.delhivery.com/track/package/${n}`;
  if (c.includes("bluedart") || c.includes("blue dart")) return `https://www.bluedart.com/trackdartresultthirdparty?trackFor=0&trackNo=${n}`;
  return `https://www.google.com/search?q=${encodeURIComponent(`${courier ?? ""} tracking ${t}`.trim())}`;
}

/** What to show as the tracking number: a pasted address is not worth printing in full. */
export function trackingLabel(tracking: string | null | undefined): string {
  const t = (tracking ?? "").trim();
  return /^https?:\/\//i.test(t) ? "your parcel" : t;
}
