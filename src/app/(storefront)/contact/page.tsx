import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PolicyPage } from "@/components/store/PolicyPage";
import { getStoreSettings } from "@/lib/catalog";

export const metadata: Metadata = { title: "Contact Us" };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const s = await getStoreSettings();
  return (
    <PolicyPage title="Contact Us" intro="Questions about an order, a fabric or a size? We are happy to help.">
      <div className="space-y-5">
        {s.supportPhone && (
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-[#5c1d24] mt-0.5" />
            <div>
              <p className="font-semibold text-[#1a1a1a]">Phone / WhatsApp</p>
              <a href={`tel:${s.supportPhone.replace(/[^+\d]/g, "")}`} className="hover:underline">{s.supportPhone}</a>
            </div>
          </div>
        )}
        {s.supportEmail && (
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-[#5c1d24] mt-0.5" />
            <div>
              <p className="font-semibold text-[#1a1a1a]">Email</p>
              <a href={`mailto:${s.supportEmail}`} className="hover:underline">{s.supportEmail}</a>
            </div>
          </div>
        )}
        {s.address && (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#5c1d24] mt-0.5" />
            <div>
              <p className="font-semibold text-[#1a1a1a]">{s.legalName || s.storeName}</p>
              <p className="whitespace-pre-line">{s.address}</p>
              {s.gstin && <p className="mt-1 text-xs text-[#6f6f6f]">GSTIN: {s.gstin}</p>}
            </div>
          </div>
        )}
        {s.businessHours && (
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#5c1d24] mt-0.5" />
            <div>
              <p className="font-semibold text-[#1a1a1a]">Opening hours</p>
              <p>{s.businessHours}</p>
            </div>
          </div>
        )}
      </div>
    </PolicyPage>
  );
}
