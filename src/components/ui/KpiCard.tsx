import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-[#5c1d24]",
  className,
}: KpiCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={cn("bg-white border border-[#ebe3d5] p-4 sm:p-5 flex flex-col justify-between gap-3 min-w-0", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] tracking-[0.14em] uppercase font-semibold text-[#534343] truncate">
          {title}
        </p>
        <div className={cn("w-9 h-9 shrink-0 flex items-center justify-center bg-[#f0ede9]", iconColor)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-xl sm:text-2xl font-[family-name:var(--font-playfair)] font-medium text-[#2b1e1a] truncate">
          {value}
        </p>
        {change !== undefined && (
          <p className={cn("text-xs font-medium mt-1", isPositive ? "text-emerald-700" : "text-[#ba1a1a]")}>
            {isPositive ? "+" : ""}{change}% vs last month
          </p>
        )}
      </div>
    </div>
  );
}

