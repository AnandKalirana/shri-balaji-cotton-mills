"use client";
import { cn } from "@/lib/utils";

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

/** iOS-style segmented control: a soft track with a raised white selected segment. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-0.5 p-1 rounded-full bg-[#2b1e1a]/[0.06] overflow-x-auto scrollbar-none max-w-full",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-200 min-h-[36px]",
              active
                ? "bg-white text-[#2b1e1a] shadow-[0_1px_3px_rgba(43,30,26,0.18)]"
                : "text-[#534343] hover:text-[#2b1e1a]"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
