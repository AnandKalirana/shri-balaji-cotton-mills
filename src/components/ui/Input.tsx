"use client";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[#444444]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-transparent border-0 border-b border-[#c5a880] px-0 py-3 text-sm text-[#1a1a1a] placeholder:text-[#6f6f6f]",
            "focus:outline-none focus:border-b-[1.5px] focus:border-[#5c1d24]",
            "transition-colors duration-200 min-h-[48px]",
            error && "border-[#ba1a1a] focus:border-[#ba1a1a]",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#ba1a1a]">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#6f6f6f]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
