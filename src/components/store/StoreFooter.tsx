import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { categories } from "@/lib/data";
import { Globe, Share2, Compass, Mail, Phone, MapPin } from "lucide-react";

interface StoreFooterProps {
  storeName?: string;
  phone?: string;
  email?: string;
}

export function StoreFooter({
  storeName = "Shri Balaji Cotton Mills",
  phone = "+91 98765 00000",
  email = "concierge@shribalajicottonmills.in",
}: StoreFooterProps) {
  return (
    <footer className="bg-[#281b17] text-[#faf7f2] mt-auto border-t border-[#53433e]">
      {/* Main footer */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo tone="light" alt={storeName} className="h-9 mb-4" />
            <p className="text-sm text-[#d8c2bb] leading-relaxed max-w-xs">
              Fabrics, kurta sets, kurtis, stretchy blouses, saree shapewear and men&apos;s wear, delivered across India.
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center border border-[#53433e] text-[#d8c2bb] hover:border-[#c5a880] hover:text-[#c5a880] transition-colors"
                aria-label="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center border border-[#53433e] text-[#d8c2bb] hover:border-[#c5a880] hover:text-[#c5a880] transition-colors"
                aria-label="Share Collection"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center border border-[#53433e] text-[#d8c2bb] hover:border-[#c5a880] hover:text-[#c5a880] transition-colors"
                aria-label="Loom Origin"
              >
                <Compass className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-[11px] tracking-[0.14em] uppercase font-semibold text-[#c5a880] mb-4">
              Loom Collections
            </h3>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-[#d8c2bb] hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-[11px] tracking-[0.14em] uppercase font-semibold text-[#c5a880] mb-4">
              Customer Services
            </h3>
            <ul className="space-y-3">
              {[
                "Pan-India Shipping",
                "Fabric Care Guide",
                "Fabric by the Metre",
                "Bulk & Wholesale Orders",
                "Size & Fabric Help",
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-[#d8c2bb] hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[11px] tracking-[0.14em] uppercase font-semibold text-[#c5a880] mb-4">
              Contact Us
            </h3>
            <div className="space-y-3 text-sm text-[#d8c2bb]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
                <span>12, Chowk Loom Lane, Varanasi — 221001</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#c5a880] shrink-0" />
                <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="hover:text-white transition-colors">{phone}</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#c5a880] shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
              </div>
              <p className="pt-2 text-xs text-[#867273]">
                Mon – Sat: 10:00 AM – 7:00 PM IST
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#53433e]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#867273]">
            © 2026 {storeName}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/admin" className="text-xs text-[#c5a880] hover:underline">
              Staff Login →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
