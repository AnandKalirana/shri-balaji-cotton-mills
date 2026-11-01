import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import type { Order } from "@/lib/types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function MobileOrderCard({ order }: { order: Order }) {
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="block p-4 bg-white border border-[#ebe3d5] hover:border-[#c5a880] transition-colors active:bg-[#faf7f2]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#5c1d24] tracking-wider">
              {order.orderNumber}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm font-medium text-[#2b1e1a] truncate">
            {order.customer?.name || "Patron"}
          </p>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#534343]">
            <span>{date}</span>
            <span>•</span>
            <span>{order.items?.length || 1} item{order.items?.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-semibold text-[#2b1e1a]">
            {formatPrice(order.total)}
          </span>
          <ChevronRight className="w-4 h-4 text-[#867273]" />
        </div>
      </div>
    </Link>
  );
}

