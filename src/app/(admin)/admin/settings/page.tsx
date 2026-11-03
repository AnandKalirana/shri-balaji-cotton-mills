"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Notice } from "@/components/ui/Notice";
import { api } from "@/lib/api-client";
import { DEFAULT_SETTINGS } from "@/lib/hero";
import { Check, Store, Truck } from "lucide-react";

const card =
  "bg-white border border-[#ebe3d5]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-5 sm:p-6 space-y-4";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState(DEFAULT_SETTINGS.storeName);
  const [supportPhone, setSupportPhone] = useState(DEFAULT_SETTINGS.supportPhone);
  const [supportEmail, setSupportEmail] = useState(DEFAULT_SETTINGS.supportEmail);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(String(DEFAULT_SETTINGS.freeShippingThreshold));
  const [shippingFee, setShippingFee] = useState(String(DEFAULT_SETTINGS.standardShippingFee));
  const [enableCod, setEnableCod] = useState(true);
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

  if (loading) return <div className="py-24 text-center text-sm text-[#867273]">Loading…</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-[#2b1e1a]">
          Store settings
        </h2>
        <p className="text-xs text-[#867273]">Contact details, shipping and payment options.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={card}>
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#c5a880]" />
            <h3 className="text-xs tracking-[0.14em] uppercase font-semibold text-[#5c1d24]">Store & contact</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Store name" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
            <Input label="Support phone" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
          </div>
          <Input label="Contact email" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
        </div>

        <div className={card}>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#c5a880]" />
            <h3 className="text-xs tracking-[0.14em] uppercase font-semibold text-[#5c1d24]">Shipping & payment</h3>
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
              <span className="block text-sm font-semibold text-[#2b1e1a]">Cash on delivery</span>
              <span className="block text-xs text-[#867273]">Let customers pay when the parcel arrives.</span>
            </span>
            <input type="checkbox" checked={enableCod} onChange={(e) => setEnableCod(e.target.checked)} className="w-5 h-5 accent-[#5c1d24]" />
          </label>
          <p className="text-xs text-[#867273]">
            GST is set on each product (5% by default for handloom textiles), not here.
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
