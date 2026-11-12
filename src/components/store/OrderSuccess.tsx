"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ReceiptPrinter, type ReceiptPrinterStage } from "@/components/ui/receipt-printer";
import { formatPrice } from "@/lib/utils";

export interface OrderSummary {
  orderNumber: string;
  email: string;
  total: number;
  paymentLabel: string;
  lines: { name: string; detail: string }[];
  placedAt: string;
}

const MAX_LINES = 5;

/** Shown after an order is placed: a small printer that prints the customer's receipt. */
export function OrderSuccess({ order }: { order: OrderSummary }) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<ReceiptPrinterStage>("processing");

  useEffect(() => {
    if (reduce) {
      const t = setTimeout(() => setStage("complete"), 0);
      return () => clearTimeout(t);
    }
    const a = setTimeout(() => setStage("printing"), 900);
    const b = setTimeout(() => setStage("complete"), 900 + 1900);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [reduce]);

  const shown = order.lines.slice(0, MAX_LINES);
  const more = order.lines.length - shown.length;

  return (
    <div className="min-h-[70vh] flex flex-col items-center bg-cream px-4 py-12 sm:py-16">
      <ReceiptPrinter.Root stage={stage} aria-label="Your order receipt">
        <ReceiptPrinter.Machine>
          <ReceiptPrinter.Header>
            <span className="text-xs font-medium tracking-wide text-sand">Shri Balaji Cotton Mills</span>
          </ReceiptPrinter.Header>
          <ReceiptPrinter.Screen>
            <ReceiptPrinter.Status />
          </ReceiptPrinter.Screen>
        </ReceiptPrinter.Machine>

        <ReceiptPrinter.Output>
          <ReceiptPrinter.Paper>
            <p className="text-center text-sm font-bold uppercase">Shri Balaji Cotton Mills</p>
            <p className="text-center text-[11px] text-muted mt-1">Thank you for your order</p>
            <div className="my-4 border-t border-dashed border-ink/40" />
            <div className="flex justify-between text-xs"><span>Order</span><span className="font-bold">{order.orderNumber}</span></div>
            <div className="flex justify-between text-xs mt-1"><span>Date</span><span>{order.placedAt}</span></div>
            <div className="my-4 border-t border-dashed border-ink/40" />
            <ul className="space-y-2 text-xs">
              {shown.map((l, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span className="min-w-0 break-words">{l.name}</span>
                  <span className="shrink-0 text-muted">{l.detail}</span>
                </li>
              ))}
              {more > 0 && <li className="text-muted">+ {more} more item{more === 1 ? "" : "s"}</li>}
            </ul>
            <div className="my-4 border-t border-dashed border-ink/40" />
            <div className="flex justify-between text-sm font-bold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            <p className="text-[11px] text-muted mt-1">{order.paymentLabel}</p>
            <div className="my-4 border-t border-dashed border-ink/40" />
            <p className="text-[11px] text-center leading-relaxed">
              We have emailed the details to {order.email}. We will update you when your order ships.
            </p>
          </ReceiptPrinter.Paper>
        </ReceiptPrinter.Output>
      </ReceiptPrinter.Root>

      <div className={`-mt-6 flex w-full max-w-sm flex-col gap-3 transition-opacity duration-300 ${stage === "complete" ? "opacity-100" : "opacity-0 pointer-events-none"}`} aria-hidden={stage !== "complete"}>
        <Link href="/orders" className="press flex h-12 items-center justify-center bg-wine text-white text-sm font-medium hover:bg-ink">
          View my orders
        </Link>
        <Link href="/" className="press flex h-12 items-center justify-center border border-sand text-sm font-medium text-ink hover:bg-mist">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
