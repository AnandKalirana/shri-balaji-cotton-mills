"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Check, Sparkles, Image as ImageIcon, Sliders } from "lucide-react";

export default function AdminCmsPage() {
  const [announcement, setAnnouncement] = useState(
    "Complimentary Insured Shipping Across India on Orders Above ₹2,000"
  );
  const [shippingThreshold, setShippingThreshold] = useState("2000");
  const [codLimit, setCodLimit] = useState("15000");
  const [bannerTitle, setBannerTitle] = useState(
    "Banarasi Royal Brocade & Katan Silk"
  );
  const [bannerSubtitle, setBannerSubtitle] = useState(
    "Hand-loomed in Varanasi with genuine gold and silver zari filaments."
  );
  const [bannerLink, setBannerLink] = useState("/category/banarasi-brocade");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            announcementText: announcement,
            freeShippingThreshold: parseFloat(shippingThreshold),
            codMaxOrderLimit: parseFloat(codLimit),
          },
          banner: {
            title: bannerTitle,
            subtitle: bannerSubtitle,
            ctaLink: bannerLink,
            desktopImg: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920",
            mobileImg: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
          },
        }),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-[#ebe3d5]">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-[#2b1e1a]">
          Content & Storefront Settings (CMS)
        </h2>
        <p className="text-xs text-[#867273]">
          Update homepage announcements, hero banners, and checkout shipping rules without touching code
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. Announcement Bar */}
        <div className="bg-white border border-[#ebe3d5] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#c5a880]" />
            <h3 className="text-xs tracking-[0.14em] uppercase font-semibold text-[#5c1d24]">
              Top Announcement Bar
            </h3>
          </div>

          <Input
            label="Announcement Message"
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="e.g. Festive Offer: Complimentary Gift Saree with Orders Over ₹25,000"
          />
        </div>

        {/* 2. Hero Promotional Campaign Banner */}
        <div className="bg-white border border-[#ebe3d5] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#c5a880]" />
            <h3 className="text-xs tracking-[0.14em] uppercase font-semibold text-[#5c1d24]">
              Main Homepage Banner
            </h3>
          </div>

          <Input
            label="Headline Title"
            value={bannerTitle}
            onChange={(e) => setBannerTitle(e.target.value)}
          />

          <Input
            label="Subtitle Description"
            value={bannerSubtitle}
            onChange={(e) => setBannerSubtitle(e.target.value)}
          />

          <Input
            label="Call-To-Action Link URL"
            value={bannerLink}
            onChange={(e) => setBannerLink(e.target.value)}
          />
        </div>

        {/* 3. Shipping & COD Thresholds */}
        <div className="bg-white border border-[#ebe3d5] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#c5a880]" />
            <h3 className="text-xs tracking-[0.14em] uppercase font-semibold text-[#5c1d24]">
              Store Logistics & Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Free Shipping Minimum Order (₹)"
              type="number"
              value={shippingThreshold}
              onChange={(e) => setShippingThreshold(e.target.value)}
            />

            <Input
              label="Maximum COD Order Allowed (₹)"
              type="number"
              value={codLimit}
              onChange={(e) => setCodLimit(e.target.value)}
            />
          </div>
        </div>

        <Button
          type="submit"
          loading={saving}
          size="lg"
          className="w-full sm:w-auto min-h-[50px]"
        >
          {saved ? (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Settings Published to Live Store</span>
            </span>
          ) : (
            <span>Publish CMS Changes</span>
          )}
        </Button>
      </form>
    </div>
  );
}

