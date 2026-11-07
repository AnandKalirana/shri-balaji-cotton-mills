"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Notice } from "@/components/ui/Notice";
import { api } from "@/lib/api-client";
import { DEFAULT_SETTINGS } from "@/lib/hero";
import { Building2, Check, Store, Truck } from "lucide-react";

const card =
  "bg-white border border-[#e5e5e3]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-5 sm:p-6 space-y-4";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState(DEFAULT_SETTINGS.storeName);
  const [supportPhone, setSupportPhone] = useState(DEFAULT_SETTINGS.supportPhone);
  const [supportEmail, setSupportEmail] = useState(DEFAULT_SETTINGS.supportEmail);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(String(DEFAULT_SETTINGS.freeShippingThreshold));
  const [shippingFee, setShippingFee] = useState(String(DEFAULT_SETTINGS.standardShippingFee));
  const [enableCod, setEnableCod] = useState(true);
  const [biz, setBiz] = useState({
    legalName: "",
    gstin: "",
    address: "",
    businessHours: DEFAULT_SETTINGS.businessHours,
    instagramUrl: "",
    facebookUrl: "",
    youtubeUrl: "",
  });
  const setB = (k: keyof typeof biz) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setBiz((b) => ({ ...b, [k]: e.target.value }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ settings: typeof DEFAULT_SETTINGS }>("/api/admin/settings").then((res) => {
      if (res.ok) {
        const s = res.data.settings;
        setStoreName(s.storeName);
        setSupportPhone(s.supportPhone);
        setSupportEmail(s.supportEmail);
        setFreeShippingThreshold(String(s.freeShippingThreshold));
        setShippingFee(String(s.standardShippingFee));
        setEnableCod(s.enableCod);
        setBiz({
          legalName: s.legalName ?? "",
          gstin: s.gstin ?? "",
          address: s.address ?? "",
          businessHours: s.businessHours ?? "",
          instagramUrl: s.instagramUrl ?? "",
          facebookUrl: s.facebookUrl ?? "",
          youtubeUrl: s.youtubeUrl ?? "",
        });
      } else {
        setError(res.error);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    const res = await api("/api/admin/settings", {
      method: "PUT",
      json: {
        storeName,
        supportPhone,
        supportEmail,
        freeShippingThreshold: parseFloat(freeShippingThreshold) || 0,
        standardShippingFee: parseFloat(shippingFee) || 0,
        enableCod,
        ...biz,
      },
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(res.error);
    }
  };

  if (loading) return <div className="py-24 text-center text-sm text-[#6f6f6f]">Loading…</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-[#1a1a1a]">
          Store settings
        </h2>
        <p className="text-xs text-[#6f6f6f]">Contact details, shipping and payment options.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={card}>
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#c5a880]" />
            <h3 className="text-xs font-medium text-[#5c1d24]">Store & contact</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Store name" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
            <Input label="Support phone" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
          </div>
          <Input label="Contact email" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
        </div>

        <div className={card}>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#c5a880]" />
            <h3 className="text-xs font-medium text-[#5c1d24]">Business details</h3>
          </div>
          <p className="text-xs text-[#6f6f6f]">
            Shown in the footer, on the Contact page and in the policy pages. Anything left blank is simply hidden.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Registered business name" value={biz.legalName} onChange={setB("legalName")} />
            <Input
              label="GSTIN"
              value={biz.gstin}
              onChange={setB("gstin")}
              maxLength={15}
              placeholder="15 characters"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="shop-address" className="text-xs font-medium text-[#444444]">
              Shop address
            </label>
            <textarea
              id="shop-address"
              rows={3}
              value={biz.address}
              onChange={setB("address")}
              maxLength={300}
              className="w-full bg-transparent border-0 border-b border-[#c5a880] px-0 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-b-[1.5px] focus:border-[#5c1d24] resize-none"
            />
          </div>
          <Input label="Opening hours" value={biz.businessHours} onChange={setB("businessHours")} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Instagram link" value={biz.instagramUrl} onChange={setB("instagramUrl")} placeholder="https://" />
            <Input label="Facebook link" value={biz.facebookUrl} onChange={setB("facebookUrl")} placeholder="https://" />
            <Input label="YouTube link" value={biz.youtubeUrl} onChange={setB("youtubeUrl")} placeholder="https://" />
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#c5a880]" />
            <h3 className="text-xs font-medium text-[#5c1d24]">Shipping & payment</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Free shipping minimum (₹)"
              type="number"
              min={0}
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
            />
            <Input
              label="Shipping fee below minimum (₹)"
              type="number"
              min={0}
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
            />
          </div>
          <label className="pt-2 flex items-center justify-between gap-4 cursor-pointer">
            <span>
              <span className="block text-sm font-semibold text-[#1a1a1a]">Cash on delivery</span>
              <span className="block text-xs text-[#6f6f6f]">Let customers pay when the parcel arrives.</span>
            </span>
            <input type="checkbox" checked={enableCod} onChange={(e) => setEnableCod(e.target.checked)} className="w-5 h-5 accent-[#5c1d24]" />
          </label>
          <p className="text-xs text-[#6f6f6f]">
            GST is set on each product (5% by default for textiles), not here.
          </p>
        </div>

        {error && <Notice tone="error">{error}</Notice>}

        <Button type="submit" loading={saving} size="lg" className="w-full sm:w-auto rounded-full min-h-[50px]">
          {saved ? (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Settings saved</span>
            </span>
          ) : (
            <span>Save settings</span>
          )}
        </Button>
      </form>
    </div>
  );
}
