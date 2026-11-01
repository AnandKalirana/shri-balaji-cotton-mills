"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Check, Shield, Store, Truck, Phone } from "lucide-react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [storeName, setStoreName] = useState("Shri Balaji Cotton Mills");
  const [supportPhone, setSupportPhone] = useState("+91 98765 00000");
  const [supportEmail, setSupportEmail] = useState("concierge@shribalajicottonmills.in");
  const [gstRate, setGstRate] = useState("5.0");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("2000");
  const [enableCod, setEnableCod] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-[#ebe3d5]">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl font-medium text-[#2b1e1a]">
          Showroom & Atelier Configuration
        </h2>
        <p className="text-xs text-[#867273]">
          Manage boutique contact details, tax compliance, and shipping rules
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Info */}
        <div className="bg-white border border-[#ebe3d5]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#c5a880]" />
            <h3 className="text-xs tracking-[0.14em] uppercase font-semibold text-[#5c1d24]">
              Boutique Identity & Concierge
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Storefront Name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
            <Input
              label="Concierge Phone"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
            />
          </div>

          <Input
            label="Official Contact Email"
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
          />
        </div>

        {/* Taxation & Compliance */}
        <div className="bg-white border border-[#ebe3d5]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#c5a880]" />
            <h3 className="text-xs tracking-[0.14em] uppercase font-semibold text-[#5c1d24]">
              Indian Textile Tax Compliance
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Handloom GST Rate (%)"
              type="number"
              value={gstRate}
              onChange={(e) => setGstRate(e.target.value)}
              helperText="Statutory rate is 5% for Indian woven textiles"
            />
            <Input
              label="Free Shipping Order Minimum (₹)"
              type="number"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
            />
          </div>

          {/* COD Toggle */}
          <div className="pt-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#2b1e1a]">
                Enable Cash on Delivery (COD)
              </p>
              <p className="text-xs text-[#867273]">
                Allows customers to pay upon doorstep delivery across India
              </p>
            </div>
            <input
              type="checkbox"
              checked={enableCod}
              onChange={(e) => setEnableCod(e.target.checked)}
              className="w-5 h-5 accent-[#5c1d24]"
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full sm:w-auto min-h-[50px]">
          {saved ? (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Settings Saved Successfully</span>
            </span>
          ) : (
            <span>Save Configuration</span>
          )}
        </Button>
      </form>
    </div>
  );
}

