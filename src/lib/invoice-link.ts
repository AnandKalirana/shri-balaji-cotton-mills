import { createHmac, timingSafeEqual } from "crypto";

function key(): string {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32)) {
    throw new Error("JWT_SECRET must be set to a random string of at least 32 characters.");
  }
  return createHmac("sha256", secret || "dev-only-secret-do-not-use-in-production").update("invoice-link").digest("hex");
}

/** A private key for one order's invoice, so guests can open it from their email without signing in. */
export function invoiceToken(orderNumber: string): string {
  return createHmac("sha256", key()).update(orderNumber).digest("hex").slice(0, 32);
}

export function invoiceTokenValid(orderNumber: string, token: string | null | undefined): boolean {
  if (!token) return false;
  const a = Buffer.from(invoiceToken(orderNumber));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Full link for emails. Null when the website address isn't configured. */
export function invoiceUrl(orderNumber: string): string | null {
  const base = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/invoice/${encodeURIComponent(orderNumber)}?t=${invoiceToken(orderNumber)}`;
}
