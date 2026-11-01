import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Shri Balaji Cotton Mills — Luxury Indian Handlooms & Textiles",
    template: "%s | Shri Balaji Cotton Mills",
  },
  description:
    "Exquisite handwoven cottons, pure silk weaves, Banarasi brocades, and bespoke bridal fabrics from Shri Balaji Cotton Mills.",
  keywords: ["Shri Balaji Cotton Mills", "cotton mills", "Indian textiles", "handloom", "zari", "silk", "brocade"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Shri Balaji Cotton Mills",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#5c1d24",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#fcf9f4] text-[#1c1c19] antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
