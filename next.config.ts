import type { NextConfig } from "next";

// Safe headers, enforced now. They can't break the site: they only stop framing, sniffing and leaky referrers.
const enforcedCsp = ["frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'"].join("; ");

// The full content policy is only REPORTED for now (it logs problems in the browser console but blocks nothing).
// Once you have browsed the whole site and checkout with the console open and seen no warnings, move this
// string into the enforced "Content-Security-Policy" header above.
const reportOnlyCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://*.razorpay.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://lh3.googleusercontent.com https://stitch.googleapis.com https://*.supabase.co https://*.razorpay.com",
  "connect-src 'self' https://*.razorpay.com https://lumberjack.razorpay.com",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com",
  "form-action 'self' https://api.razorpay.com",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: enforcedCsp },
  { key: "Content-Security-Policy-Report-Only", value: reportOnlyCsp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "stitch.googleapis.com",
      },
      // Supabase Storage (product & banner photos)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
