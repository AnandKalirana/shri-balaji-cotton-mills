"use client";
import { useCallback, useEffect, useState } from "react";
import { Tag, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Notice } from "@/components/ui/Notice";
import { api } from "@/lib/api-client";

interface CouponItem {
  id: string;
  code: string;
  discountPct: number;
  minOrder: number;
  usageCount: number;
  isActive: boolean;
  validUntil: string;
}

const card = "bg-white border border-[#e5e5e3]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)]";

function inOneYear() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

const fetchCoupons = () => api<{ coupons: CouponItem[] }>("/api/admin/coupons");

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState("");
  const [discount, setDiscount] = useState("10");
  const [minOrder, setMinOrder] = useState("5000");
  const [validUntil, setValidUntil] = useState(inOneYear());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const apply = useCallback((res: Awaited<ReturnType<typeof fetchCoupons>>) => {
    if (res.ok) setCoupons(res.data.coupons);
    else setMessage({ tone: "error", text: res.error });
    setLoading(false);
  }, []);

  const load = useCallback(() => fetchCoupons().then(apply), [apply]);

  useEffect(() => {
    fetchCoupons().then(apply);
  }, [apply]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    const res = await api("/api/admin/coupons", {
      method: "POST",
      json: { code: newCode, discountPct: Number(discount), minOrder: Number(minOrder), validUntil },
    });
    setSaving(false);
    if (res.ok) {
      setNewCode("");
      setMessage({ tone: "success", text: "Coupon created." });
      load();
    } else {
      setMessage({ tone: "error", text: res.error });
    }
  };

  const toggle = async (c: CouponItem) => {
    const res = await api(`/api/admin/coupons/${c.id}`, { method: "PATCH", json: { isActive: !c.isActive } });
    if (res.ok) setCoupons((prev) => prev.map((x) => (x.id === c.id ? { ...x, isActive: !c.isActive } : x)));
    else setMessage({ tone: "error", text: res.error });
  };

  const remove = async (c: CouponItem) => {
    if (!window.confirm(`Delete coupon ${c.code}? This can't be undone.`)) return;
    const res = await api(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
    if (res.ok) setCoupons((prev) => prev.filter((x) => x.id !== c.id));
    else setMessage({ tone: "error", text: res.error });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-[#1a1a1a]">
          Coupons
        </h2>
        <p className="text-xs text-[#6f6f6f]">Create percentage discount codes with a minimum order value.</p>
      </div>

      <Notice tone="info">
        Codes you create here are saved, but the checkout doesn&apos;t apply discount codes yet — that&apos;s the next step to
        wire up.
      </Notice>

      <form onSubmit={handleAdd} className={`${card} p-5 sm:p-6 space-y-4`}>
        <h3 className="text-xs font-medium text-[#5c1d24]">New coupon</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <Input label="Code *" value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="FESTIVE20" required />
          <Input label="Discount % *" type="number" min={1} max={90} value={discount} onChange={(e) => setDiscount(e.target.value)} required />
          <Input label="Min order (₹) *" type="number" min={0} value={minOrder} onChange={(e) => setMinOrder(e.target.value)} required />
          <Input label="Valid until *" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} required />
        </div>
        <Button type="submit" size="sm" loading={saving} className="rounded-full">
          <Plus className="w-4 h-4 mr-1" />
          <span>Create coupon</span>
        </Button>
      </form>

      {message && <Notice tone={message.tone}>{message.text}</Notice>}

      <div className={`${card} overflow-hidden divide-y divide-[#e5e5e3]/70`}>
        {loading ? (
          <p className="p-6 text-sm text-[#6f6f6f]">Loading…</p>
        ) : coupons.length === 0 ? (
          <p className="p-6 text-sm text-[#6f6f6f]">No coupons yet. Create your first one above.</p>
        ) : (
          coupons.map((c) => (
            <div key={c.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f5f5f3] text-[#5c1d24] flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm tracking-wider text-[#1a1a1a]">{c.code}</p>
                  <p className="text-xs text-[#6f6f6f]">
                    {c.discountPct}% off above ₹{c.minOrder.toLocaleString("en-IN")} · until{" "}
                    {new Date(c.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-full px-3 py-1">
                  {c.usageCount} used
                </span>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={c.isActive} onChange={() => toggle(c)} className="w-5 h-5 accent-[#5c1d24]" />
                  Active
                </label>
                <button
                  onClick={() => remove(c)}
                  aria-label={`Delete ${c.code}`}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#6f6f6f] hover:text-[#ba1a1a] hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
