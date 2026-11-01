import { cn } from "@/lib/utils";

type Status =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "PENDING_PAYMENT";

const config: Record<string, { label: string; className: string }> = {
  pending:         { label: "Pending",         className: "bg-amber-50 text-amber-800 border-amber-200" },
  pending_payment: { label: "Payment Pending", className: "bg-amber-50 text-amber-800 border-amber-200" },
  confirmed:       { label: "Confirmed",       className: "bg-blue-50 text-blue-800 border-blue-200" },
  processing:      { label: "Processing",      className: "bg-violet-50 text-violet-800 border-violet-200" },
  shipped:         { label: "Shipped",         className: "bg-cyan-50 text-cyan-800 border-cyan-200" },
  delivered:       { label: "Delivered",       className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  cancelled:       { label: "Cancelled",       className: "bg-rose-50 text-rose-800 border-rose-200" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status?.toLowerCase() || "pending";
  const match = config[key] || { label: status, className: "bg-stone-50 text-stone-800 border-stone-200" };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-[11px] tracking-wide font-semibold border",
        match.className,
        className
      )}
    >
      {match.label}
    </span>
  );
}

