import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "error" | "success";
  className?: string;
}

const variants = {
  default: "bg-[#5c1d24] text-white",
  gold: "bg-[#c5a880] text-[#2b1e1a]",
  error: "bg-[#ba1a1a] text-white",
  success: "bg-emerald-700 text-white",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] tracking-[0.14em] uppercase font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
