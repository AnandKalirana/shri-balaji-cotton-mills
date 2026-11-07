"use client";
import { useState } from "react";
import { X, Check } from "lucide-react";
import { Stepper } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId: string;
  variantId?: string;
  currentStock: number;
  isFabric?: boolean;
  onSaved?: (newStock: number) => void;
}

export function StockAdjustModal({
  isOpen,
  onClose,
  productName,
  productId,
  variantId,
  currentStock,
  isFabric = false,
  onSaved,
}: StockAdjustModalProps) {
  const [stock, setStock] = useState(currentStock);
  const [reason, setReason] = useState("Showroom floor recount");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          variantId,
          newBalance: stock,
          quantityDelta: stock - currentStock,
          reason,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSaved?.(stock);
          onClose();
        }, 700);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Couldn't save the new stock. Please try again.");
      }
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const delta = Math.round((stock - currentStock) * 10) / 10;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1a1a1a]/70 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Sheet / Modal Container */}
      <div className="relative w-full sm:max-w-md bg-[#f7f7f5] border-t sm:border border-[#e5e5e3] p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-medium text-[#6f6f6f]">
              Rapid Stock Adjuster
            </span>
            <h3 className="font-[family-name:var(--font-playfair)] text-lg font-medium text-[#1a1a1a] line-clamp-1">
              {productName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-[#444444] hover:bg-[#f5f5f3]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current vs New Status */}
        <div className="bg-[#f5f5f3] p-4 border border-[#e5e5e3] mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6f6f6f]">
              Previous Balance
            </p>
            <p className="text-sm font-semibold text-[#1a1a1a]">
              {currentStock} {isFabric ? "metres" : "units"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#6f6f6f]">
              Adjustment
            </p>
            <p
              className={`text-sm font-semibold ${
                delta > 0
                  ? "text-emerald-700"
                  : delta < 0
                  ? "text-[#ba1a1a]"
                  : "text-[#444444]"
              }`}
            >
              {delta > 0 ? `+${delta}` : delta} {isFabric ? "m" : "pcs"}
            </p>
          </div>
        </div>

        {/* Large Mobile Stepper */}
        <div className="flex flex-col items-center justify-center py-4 bg-white border border-[#e5e5e3]/70 rounded-2xl shadow-[0_1px_2px_rgba(43,30,26,0.04)] mb-4">
          <p className="text-xs text-[#6f6f6f] mb-2 font-medium">
            Target Stock
          </p>
          <Stepper
            value={stock}
            onChange={setStock}
            min={0}
            max={5000}
            step={isFabric ? 0.5 : 1}
            unit={isFabric ? "metres" : "units"}
            large
          />

          {/* Rapid Increment Pills */}
          <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
            {[1, 5, 10, 25].map((amt) => (
              <button
                key={amt}
                onClick={() => setStock((prev) => prev + amt)}
                className="px-3 py-1.5 text-xs bg-[#f5f5f3] border border-[#e5e5e3] hover:border-[#c5a880] text-[#1a1a1a] font-semibold active:bg-[#e5e2dd]"
              >
                +{amt}{isFabric ? "m" : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Reason Selector */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-[#444444] mb-1.5">
            Audit Ledger Note
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-white border border-[#c5a880] px-3 py-3 text-sm text-[#1a1a1a] focus:outline-none"
          >
            <option value="Showroom floor recount">Showroom floor recount</option>
            <option value="Received new loom delivery">Received new loom delivery</option>
            <option value="Damage write-off">Damage write-off</option>
            <option value="Thaan cut breakdown">Thaan cut breakdown</option>
            <option value="VIP customer hold release">VIP customer hold release</option>
          </select>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-2xl bg-rose-50 text-rose-900 text-sm px-4 py-3">
            {error}
          </p>
        )}

        {/* Action Button */}
        <Button
          onClick={handleSave}
          loading={saving}
          fullWidth
          size="lg"
          className="min-h-[52px]"
        >
          {success ? (
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Balance Updated</span>
            </span>
          ) : (
            <span>Save New Balance ({stock} {isFabric ? "m" : "units"})</span>
          )}
        </Button>
      </div>
    </div>
  );
}

