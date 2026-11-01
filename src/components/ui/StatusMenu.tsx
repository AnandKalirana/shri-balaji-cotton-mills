"use client";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusMenuProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

/**
 * Custom dropdown replacing the native <select>. The menu is position: fixed so it
 * is never clipped by a scrolling table container.
 */
export function StatusMenu({ value, options, onChange, disabled, ariaLabel }: StatusMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const current = options.find((o) => o.value === value)?.label ?? value;

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !menuRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const toggle = () => {
    if (disabled) return;
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setOpen((o) => !o);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-2 pl-4 pr-3 py-2 rounded-full bg-[#2b1e1a]/[0.06] hover:bg-[#2b1e1a]/10 text-[13px] font-medium text-[#2b1e1a] transition-colors min-h-[36px] disabled:opacity-50",
          "focus-visible:outline-2 focus-visible:outline-[#5c1d24]"
        )}
      >
        {current}
        <ChevronDown className={cn("w-3.5 h-3.5 text-[#867273] transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <ul
          ref={menuRef}
          role="listbox"
          style={{ top: pos.top, right: pos.right }}
          className="fixed z-50 min-w-[180px] p-1.5 rounded-2xl bg-[#fcf9f4]/95 backdrop-blur-xl border border-[#ebe3d5] shadow-[0_20px_50px_-20px_rgba(43,30,26,0.4)] text-left"
        >
          {options.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (o.value !== value) onChange(o.value);
                }}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-sm text-[#2b1e1a] hover:bg-[#2b1e1a]/5 transition-colors"
              >
                {o.label}
                {o.value === value && <Check className="w-4 h-4 text-[#5c1d24]" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
