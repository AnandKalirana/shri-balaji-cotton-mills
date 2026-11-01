"use client";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-[#5c1d24] text-white hover:bg-[#2b1e1a] border border-transparent focus-visible:ring-2 focus-visible:ring-[#5c1d24]",
  secondary: "bg-transparent text-[#2b1e1a] border border-[#c5a880] hover:bg-[#faf7f2] focus-visible:ring-2 focus-visible:ring-[#c5a880]",
  ghost: "bg-transparent text-[#5c1d24] border border-transparent hover:bg-[#f0ede9] focus-visible:ring-2 focus-visible:ring-[#5c1d24]",
  danger: "bg-[#ba1a1a] text-white border border-transparent hover:bg-red-800 focus-visible:ring-2 focus-visible:ring-red-600",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-xs tracking-widest uppercase font-semibold min-h-[36px]",
  md: "px-8 py-3 text-xs tracking-widest uppercase font-semibold min-h-[48px]",
  lg: "px-12 py-4 text-sm tracking-widest uppercase font-semibold min-h-[56px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, fullWidth, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
