import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { categories } from "@/lib/data";
import { Mail, Phone, MapPin } from "lucide-react";

interface StoreFooterProps {
  storeName?: string;
  phone?: string;
  email?: string;
  legalName?: string;
  gstin?: string;
  address?: string;
  businessHours?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
}

export function StoreFooter({
  storeName = "Shri Balaji Cotton Mills",
  phone = "",
  email = "",
  legalName = "",
  gstin = "",
  address = "",
  businessHours = "",
  instagramUrl = "",
  facebookUrl = "",
  youtubeUrl = "",
}: StoreFooterProps) {
  const socials = [
    { label: "Instagram", href: instagramUrl },
    { label: "Facebook", href: facebookUrl },
    { label: "YouTube", href: youtubeUrl },
  ].filter((x) => x.href);
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
            {socials.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {socials.map((x) => (
                  <a
                    key={x.label}
                    href={x.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 h-9 rounded-full inline-flex items-center border border-[#53433e] text-xs tracking-wide text-[#d8c2bb] hover:border-[#c5a880] hover:text-[#c5a880] transition-colors"
                  >
                    {x.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-[11px] tracking-[0.14em] uppercase font-semibold text-[#c5a880] mb-4">
              Shop
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
                { label: "Shipping Policy", href: "/shipping-policy" },
                { label: "Returns & Refunds", href: "/returns-and-refunds" },
                { label: "Terms & Conditions", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Contact Us", href: "/contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-[#d8c2bb] hover:text-white transition-colors">
                    {item.label}
                  </Link>
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
              {address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
                  <span className="whitespace-pre-line">{address}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#c5a880] shrink-0" />
                  <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="hover:text-white transition-colors">{phone}</a>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#c5a880] shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
                </div>
              )}
              {businessHours && <p className="pt-2 text-xs text-[#867273]">{businessHours}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#53433e]">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#867273]">
            © {new Date().getFullYear()} {legalName || storeName}. All rights reserved.
            {gstin && <span className="ml-2">GSTIN: {gstin}</span>}
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
