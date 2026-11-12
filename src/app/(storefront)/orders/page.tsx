import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { trackingLabel, trackingLink } from "@/lib/tracking";

export const metadata: Metadata = { title: "My Orders" };
export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Waiting for payment",
  CONFIRMED: "Confirmed",
  PROCESSING: "Being packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-ink mb-3">My Orders</h1>
        <p className="text-graphite mb-8">Sign in to see your orders.</p>
        <Link href="/account" className="text-sm font-medium text-wine underline">Sign in</Link>
      </div>
    );
  }
  const orders = await prisma.order
    .findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50, include: { items: true } })
    .catch(() => []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-ink mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-graphite">You haven&apos;t placed an order yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((o) => (
            <li key={o.id} className="border border-line p-4">
              <div className="flex justify-between gap-3 text-sm">
                <span className="font-semibold text-ink">{o.orderNumber}</span>
                <span className="text-wine font-medium">{LABEL[o.orderStatus] ?? o.orderStatus}</span>
              </div>
              <p className="text-xs text-muted mt-1">
                {o.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })} · {formatPrice(Number(o.total))}
              </p>
              <ul className="mt-3 text-sm text-graphite list-disc pl-5">
                {o.items.map((i) => (
                  <li key={i.id}>
                    {i.productName}
                    {i.metres != null ? ` (${i.isFullThaan ? "full thaan" : `${Number(i.metres)} m`})` : ""} × {i.quantity}
                  </li>
                ))}
              </ul>
              {o.trackingNumber && (
                <p className="mt-3 text-xs text-graphite">
                  Courier: {o.courierPartner || "-"}
                  {!/^https?:\/\//i.test(o.trackingNumber) && <> · Tracking no. {trackingLabel(o.trackingNumber)}</>}
                  {trackingLink(o.courierPartner, o.trackingNumber) && (
                    <>
                      {" · "}
                      <a href={trackingLink(o.courierPartner, o.trackingNumber)!} target="_blank" rel="noopener noreferrer" className="font-medium text-wine underline">
                        Track parcel
                      </a>
                    </>
                  )}
                </p>
              )}
              {o.orderStatus !== "PENDING_PAYMENT" && o.orderStatus !== "CANCELLED" && (
                <Link href={`/invoice/${encodeURIComponent(o.orderNumber)}`} className="inline-block mt-3 text-xs font-medium text-wine underline">
                  View invoice
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
