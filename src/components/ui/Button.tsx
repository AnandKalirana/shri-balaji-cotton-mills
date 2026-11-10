"use client";
import { Button as AstryxButton } from "@astryxdesign/core/Button";
import { Spinner } from "@astryxdesign/core/Spinner";
import { Children, forwardRef, isValidElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

/** The visible words of a button, used as its accessible name when it also holds an icon. */
function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((c) => {
      if (typeof c === "string" || typeof c === "number") return String(c);
      if (isValidElement<{ children?: ReactNode }>(c)) return textOf(c.props.children);
      return "";
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

// Touch-friendly heights (the old buttons were 36 / 48 / 56 px tall).
const heights: Record<Size, string> = { sm: "min-h-9", md: "min-h-12", lg: "min-h-14" };

const variantMap = { primary: "primary", secondary: "secondary", ghost: "ghost", danger: "destructive" } as const;

/** Shop button, built on the Astryx Button. Same props as before, so pages don't change. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, fullWidth, disabled, children, className, ...props }, ref) => {
    const label = props["aria-label"] || textOf(children) || "Button";
    // Plain words go in as the label. An icon or spinner next to words needs its own row layout. The words stay
    // visible while loading so progress text such as "Importing 3 of 10…" is still readable.
    const hasIcon = Children.toArray(children).some((c) => typeof c !== "string" && typeof c !== "number");
    return (
      <AstryxButton
        ref={ref}
        label={label}
        variant={variantMap[variant]}
        size={size}
        isDisabled={disabled || loading}
        aria-busy={loading || undefined}
        width={fullWidth ? "100%" : undefined}
        className={cn(heights[size], className)}
        {...props}
      >
        {hasIcon || loading ? (
          <span className="inline-flex items-center gap-2">
            {loading && <Spinner size="sm" shade="inherit" aria-label="Working" />}
            {children}
          </span>
        ) : undefined}
      </AstryxButton>
    );
  }
);

Button.displayName = "Button";
