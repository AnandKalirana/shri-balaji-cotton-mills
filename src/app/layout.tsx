import { siteBase } from "@/lib/site";
import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteBase()),
  title: {
    default: "Shri Balaji Cotton Mills — Fabrics, Kurtis & Everyday Wear",
    template: "%s | Shri Balaji Cotton Mills",
  },
  description:
    "Fabrics, kurta sets, kurtis, stretchy blouses and saree shapewear from Shri Balaji Cotton Mills.",
  keywords: ["Shri Balaji Cotton Mills", "cotton mills", "fabrics", "kurta set", "kurti", "stretchy blouse", "saree shapewear"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Shri Balaji Cotton Mills",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // zoom stays allowed: pinch-zoom is an accessibility feature
  viewportFit: "cover", // paint edge to edge; fixed bars add safe-area padding
  interactiveWidget: "resizes-content", // the on-screen keyboard shrinks the page instead of covering the form
  themeColor: "#5c1d24",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`h-full ${playfair.variable} ${jakarta.variable}`}>
      <body className="min-h-full flex flex-col bg-[#fcf9f4] text-[#1c1c19] antialiased overflow-x-clip">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
