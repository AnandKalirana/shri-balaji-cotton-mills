/** The store's public web address, without a trailing slash. Set SITE_URL in production. */
export function siteBase(): string {
  const configured = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  return (configured || "http://localhost:3000").replace(/\/+$/, "");
}
