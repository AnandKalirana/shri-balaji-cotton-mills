"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tag, Plus, Check } from "lucide-react";

interface CouponItem {
  id: string;
  code: string;
  discountPct: number;
  minOrder: number;
  usageCount: number;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([
    { id: "c1", code: "ATELIER10", discountPct: 10, minOrder: 5000, usageCount: 42, isActive: true },
    { id: "c2", code: "BRIDAL15", discountPct: 15, minOrder: 30000, usageCount: 18, isActive: true },
    { id: "c3", code: "VARANASI5", discountPct: 5, minOrder: 2000, usageCount: 89, isActive: true },
  ]);

  const [newCode, setNewCode] = useState("");
  const [discount, setDiscount] = useState("10");
  const [minOrder, setMinOrder] = useState("5000");

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;
    setCoupons([
      ...coupons,
      {
        id: `c_${Date.now()}`,
        code: newCode.toUpperCase(),
        discountPct: Number(discount),
        minOrder: Number(minOrder),
        usageCount: 0,
        isActive: true,
      },
    ]);
    setNewCode("");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-[#ebe3d5]">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-[#2b1e1a]">
          Promotional Coupons & Privilege Codes
        </h2>
        <p className="text-xs text-[#867273]">
          Create percentage discounts and threshold incentives for clientele
        </p>
      </div>

      {/* Add New Coupon Mini-form */}
      <form onSubmit={handleAddCoupon} className="bg-white border border-[#ebe3d5] p-5 sm:p-6 space-y-4">
        <h3 className="text-xs tracking-[0.14em] uppercase font-semibold text-[#5c1d24]">
          Generate New Coupon
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Input
            label="Coupon Code *"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="e.g. FESTIVE20"
            required
          />
          <Input
            label="Discount % *"
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            required
          />
          <Input
            label="Min Order (₹) *"
            type="number"
            value={minOrder}
            onChange={(e) => setMinOrder(e.target.value)}
            required
          />
        </div>
        <Button type="submit" size="sm" className="mt-2">
          <Plus className="w-4 h-4 mr-1" />
          <span>Add Privilege Code</span>
        </Button>
      </form>

      {/* Coupon List */}
      <div className="bg-white border border-[#ebe3d5] divide-y divide-[#ebe3d5]">
        {coupons.map((c) => (
          <div key={c.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f0ede9] text-[#5c1d24] flex items-center justify-center font-bold">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-sm tracking-wider text-[#2b1e1a]">{c.code}</p>
                <p className="text-xs text-[#867273]">
                  {c.discountPct}% off on orders above ₹{c.minOrder.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1">
                {c.usageCount} Redeemed
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

