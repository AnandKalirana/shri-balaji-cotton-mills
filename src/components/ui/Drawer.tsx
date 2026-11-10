"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "left" | "right";
  title?: string;
  className?: string;
}

export function Drawer({
  open,
  onClose,
  children,
  side = "right",
  title,
  className,
}: DrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-300",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-[#1a1a1a]/70 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || "Drawer panel"}
        className={cn(
          "absolute top-0 bottom-0 flex flex-col pb-[env(safe-area-inset-bottom)] bg-[#f7f7f5] w-full max-w-sm sm:max-w-md shadow-2xl transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          side === "right" ? "right-0" : "left-0",
          side === "right"
            ? open
              ? "translate-x-0"
              : "translate-x-full"
            : open
            ? "translate-x-0"
            : "-translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e5e3]">
          {title && (
            <h2 className="font-[family-name:var(--font-playfair)] text-lg font-medium text-[#1a1a1a]">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto w-10 h-10 flex items-center justify-center text-[#444444] hover:text-[#1a1a1a] hover:bg-[#f5f5f3] transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

