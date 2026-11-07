"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Notice } from "@/components/ui/Notice";
import { ImageField } from "@/components/admin/ImageField";
import { api } from "@/lib/api-client";
import { DEFAULT_HERO, DEFAULT_SETTINGS } from "@/lib/hero";
import { Check, Sparkles, Image as ImageIcon, Sliders, ExternalLink } from "lucide-react";

const card =
  "bg-white border border-[#ebe3d5]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-5 sm:p-6 space-y-4";

export default function AdminCmsPage() {
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  const [announcement, setAnnouncement] = useState(DEFAULT_SETTINGS.announcementText);
  const [enableAnnouncement, setEnableAnnouncement] = useState(true);
  const [shippingThreshold, setShippingThreshold] = useState(String(DEFAULT_SETTINGS.freeShippingThreshold));
  const [codLimit, setCodLimit] = useState(String(DEFAULT_SETTINGS.codMaxOrderLimit));

  const [eyebrow, setEyebrow] = useState(DEFAULT_HERO.eyebrow);
  const [title, setTitle] = useState(DEFAULT_HERO.title);
  const [subtitle, setSubtitle] = useState(DEFAULT_HERO.subtitle);
  const [ctaText, setCtaText] = useState(DEFAULT_HERO.ctaText);
  const [ctaLink, setCtaLink] = useState(DEFAULT_HERO.ctaLink);
  const [desktopImg, setDesktopImg] = useState(DEFAULT_HERO.desktopImg);
  const [mobileImg, setMobileImg] = useState("");
  const [imageOnly, setImageOnly] = useState(false);
  const [bannerActive, setBannerActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ demo: boolean; banner: typeof DEFAULT_HERO & { isActive: boolean }; settings: typeof DEFAULT_SETTINGS }>(
      "/api/admin/cms"
    ).then((res) => {
      if (res.ok) {
        const { banner, settings } = res.data;
        setDemo(res.data.demo);
        setAnnouncement(settings.announcementText);
        setEnableAnnouncement(settings.enableAnnouncement);
        setShippingThreshold(String(settings.freeShippingThreshold));
        setCodLimit(String(settings.codMaxOrderLimit));
        setEyebrow(banner.eyebrow ?? "");
        setTitle(banner.title);
        setSubtitle(banner.subtitle ?? "");
        setCtaText(banner.ctaText);
        setCtaLink(banner.ctaLink);
        setDesktopImg(banner.desktopImg);
        setMobileImg(banner.mobileImg === banner.desktopImg ? "" : banner.mobileImg);
        setImageOnly(Boolean(banner.imageOnly));
        setBannerActive(banner.isActive);
      } else {
        setError(res.error);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    const res = await api("/api/admin/cms", {
      method: "PUT",
      json: {
        settings: {
          announcementText: announcement,
          enableAnnouncement,
          freeShippingThreshold: parseFloat(shippingThreshold) || 0,
          codMaxOrderLimit: parseFloat(codLimit) || 0,
        },
        banner: {
          eyebrow,
          title,
          subtitle,
          ctaText,
          ctaLink,
          desktopImg,
          mobileImg: mobileImg || desktopImg,
          imageOnly,
          isActive: bannerActive,
        },
      },
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setDemo(false);
      setTimeout(() => setSaved(false), 3500);
    } else {
      setError(res.error);
    }
  };

  if (loading) return <div className="py-24 text-center text-sm text-[#867273]">Loading…</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-2 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-[#2b1e1a]">
            Content & storefront settings
          </h2>
          <p className="text-xs text-[#867273]">
            Edit the announcement bar, homepage banner and shipping rules. Changes go live as soon as you publish.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5c1d24] hover:underline"
        >
          View live store <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {demo && (
        <Notice tone="warning">
          Your database has no saved content yet, so you&apos;re seeing the default text. Publishing below will save it.
        </Notice>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Announcement Bar */}
        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c5a880]" />
              <h3 className="text-xs tracking-[0.14em] uppercase font-semibold text-[#5c1d24]">Top announcement bar</h3>
            </div>
            <label className="flex items-center gap-2 text-sm text-[#2b1e1a] cursor-pointer">
              <input
                type="checkbox"
                checked={enableAnnouncement}
                onChange={(e) => setEnableAnnouncement(e.target.checked)}
                className="w-5 h-5 accent-[#5c1d24]"
              />
              Show on store
            </label>
          </div>
          <Input
            label="Announcement message"
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="e.g. Festive offer: free gift saree on orders over ₹25,000"
          />
        </div>

        {/* 2. Hero Banner */}
        <div className={card}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#c5a880]" />
              <h3 className="text-xs tracking-[0.14em] uppercase font-semibold text-[#5c1d24]">Homepage banner</h3>
            </div>
            <label className="flex items-center gap-2 text-sm text-[#2b1e1a] cursor-pointer">
              <input
                type="checkbox"
                checked={bannerActive}
                onChange={(e) => setBannerActive(e.target.checked)}
                className="w-5 h-5 accent-[#5c1d24]"
              />
              Use this banner
            </label>
          </div>

          <ImageField
            label="Banner image (desktop)"
            value={desktopImg}
            onChange={setDesktopImg}
            helper="Wide photo, at least 1600 px across. JPG, PNG or WebP up to 5 MB."
          />
          <ImageField
            label="Banner image (mobile, optional)"
            value={mobileImg}
            onChange={setMobileImg}
            helper="Leave empty to use the desktop image on phones too."
          />

          <label className="flex items-start gap-2 text-sm text-[#2b1e1a] cursor-pointer">
            <input
              type="checkbox"
              checked={imageOnly}
              onChange={(e) => setImageOnly(e.target.checked)}
              className="w-5 h-5 mt-0.5 accent-[#5c1d24]"
            />
            <span>
              My image already has text on it
              <span className="block text-xs text-[#867273]">
                Shows the picture on its own, with no headline over it. The headline below is still needed for screen readers, and the button shows under the image.
              </span>
            </span>
          </label>

          <Input label="Small label above headline" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
          <div>
            <label htmlFor="banner-title" className="text-[11px] tracking-[0.14em] uppercase font-semibold text-[#534343]">
              Headline
            </label>
            <textarea
              id="banner-title"
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full bg-transparent border-0 border-b border-[#c5a880] py-3 text-sm text-[#2b1e1a] focus:outline-none focus:border-[#5c1d24] resize-none"
            />
            <p className="text-xs text-[#867273]">Press Enter to start a new line in the headline.</p>
          </div>
          <Input label="Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Button text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} />
            <Input label="Button link" value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} helperText="e.g. /category/kurti" />
          </div>
        </div>

        {/* 3. Shipping & COD */}
        <div className={card}>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#c5a880]" />
            <h3 className="text-xs tracking-[0.14em] uppercase font-semibold text-[#5c1d24]">Shipping & payment limits</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Free shipping minimum order (₹)"
              type="number"
              min={0}
              value={shippingThreshold}
              onChange={(e) => setShippingThreshold(e.target.value)}
            />
            <Input
              label="Maximum COD order (₹)"
              type="number"
              min={0}
              value={codLimit}
              onChange={(e) => setCodLimit(e.target.value)}
            />
          </div>
        </div>

        {error && <Notice tone="error">{error}</Notice>}

        <Button type="submit" loading={saving} size="lg" className="w-full sm:w-auto rounded-full min-h-[50px]">
          {saved ? (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Published to live store</span>
            </span>
          ) : (
            <span>Publish changes</span>
          )}
        </Button>
      </form>
    </div>
  );
}
