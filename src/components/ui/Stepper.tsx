"use client";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  large?: boolean;
  className?: string;
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 100,
  step = 1,
  label,
  unit,
  large = false,
  className,
}: StepperProps) {
  const handleDec = () => {
    const next = Math.max(min, Math.round((value - step) * 10) / 10);
    onChange(next);
  };

  const handleInc = () => {
    const next = Math.min(max, Math.round((value + step) * 10) / 10);
    onChange(next);
  };

  const btnSize = large ? "w-14 h-14 min-w-[56px]" : "w-12 h-12 min-w-[48px]";
  const textSize = large ? "text-lg font-semibold min-w-[64px]" : "text-sm font-medium min-w-[52px]";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <span className="text-xs font-medium text-[#444444]">
          {label}
        </span>
      )}
      <div className="inline-flex items-center border border-[#c5a880] bg-white">
        <button
          type="button"
          onClick={handleDec}
          disabled={value <= min}
          aria-label="Decrease quantity"
          className={cn(
            btnSize,
            "flex items-center justify-center text-[#1a1a1a] hover:bg-[#f5f5f3] disabled:opacity-30 disabled:cursor-not-allowed transition-colors select-none active:bg-[#e5e2dd]"
          )}
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className={cn(textSize, "text-center text-[#1a1a1a] px-2 select-none")}>
          {value}
          {unit && <span className="ml-1 text-xs text-[#6f6f6f] font-normal">{unit}</span>}
        </div>

        <button
          type="button"
          onClick={handleInc}
          disabled={value >= max}
          aria-label="Increase quantity"
          className={cn(
            btnSize,
            "flex items-center justify-center text-[#1a1a1a] hover:bg-[#f5f5f3] disabled:opacity-30 disabled:cursor-not-allowed transition-colors select-none active:bg-[#e5e2dd]"
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

