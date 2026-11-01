"use client";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { forwardRef } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-[11px] tracking-[0.14em] uppercase font-semibold text-[#534343]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full bg-transparent border-0 border-b border-[#c5a880] px-0 py-3 pr-8 text-sm text-[#2b1e1a]",
              "focus:outline-none focus:border-b-[1.5px] focus:border-[#5c1d24] appearance-none cursor-pointer",
              "transition-colors duration-200 min-h-[48px]",
              error && "border-[#ba1a1a]",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#534343] pointer-events-none" />
        </div>
        {error && <p className="text-xs text-[#ba1a1a]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
