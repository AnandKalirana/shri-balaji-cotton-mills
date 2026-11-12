import type { MetadataRoute } from "next";
import { siteBase } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/checkout", "/account", "/orders", "/wishlist", "/invoice/"] }],
    sitemap: `${siteBase()}/sitemap.xml`,
  };
}
