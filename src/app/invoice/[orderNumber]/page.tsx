import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getStoreSettings } from "@/lib/catalog";
import { invoiceTokenValid } from "@/lib/invoice-link";
import { formatPrice } from "@/lib/utils";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = { title: "Invoice", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function InvoicePage({ params, searchParams }: { params: Promise<{ orderNumber: string }>; searchParams: Promise<{ t?: string }> }) {
  const { orderNumber } = await params;
  const { t } = await searchParams;
  const order = await prisma.order.findUnique({ where: { orderNumber }, include: { items: true } });
  if (!order) notFound();

  // Allowed: the person who owns the order, the store's staff, or someone holding the private link from the email.
  const user = await getCurrentUser();
  const allowed = invoiceTokenValid(orderNumber, t) || (user && (user.role !== "CUSTOMER" || user.id === order.userId));
  if (!allowed) notFound();

  const s = await getStoreSettings();
  const addr = (order.shippingAddressSnapshot ?? {}) as { street?: string; city?: string; state?: string; pincode?: string };
  const subtotal = Number(order.subtotal);
  const discount = Number(order.discountTotal);
  const gst = Number(order.gstTotal);
  const shipping = Number(order.shippingFee);
  const taxable = subtotal - discount - gst;
  const paid = order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentStatus === "PAID" ? "Paid online" : "Online payment pending";

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 text-ink text-sm bg-white">
      <div className="flex justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Tax Invoice</h1>
          <p className="text-muted mt-1">Invoice no. {order.orderNumber}</p>
          <p className="text-muted">Date: {order.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" })}</p>
        </div>
        <PrintButton />
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-xs uppercase text-muted mb-1">Sold by</p>
          <p className="font-semibold">{s.legalName || s.storeName}</p>
          {s.address && <p className="whitespace-pre-line">{s.address}</p>}
          {s.gstin ? <p>GSTIN: {s.gstin}</p> : null}
          <p>{s.supportPhone} · {s.supportEmail}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted mb-1">Billed and shipped to</p>
          <p className="font-semibold">{order.customerName}</p>
          <p>{[addr.street, addr.city, addr.state].filter(Boolean).join(", ")}{addr.pincode ? ` - ${addr.pincode}` : ""}</p>
          <p>{order.customerPhone}</p>
        </div>
      </div>

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="border-y border-line text-left text-xs uppercase text-muted">
            <th className="py-2 pr-2">Item</th>
            <th className="py-2 pr-2 text-right">Qty</th>
            <th className="py-2 pr-2 text-right">Rate</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i) => (
            <tr key={i.id} className="border-b border-line align-top">
              <td className="py-2 pr-2">
                {i.productName}
                {i.metres != null && <span className="text-muted"> {i.isFullThaan ? "(full thaan)" : `(${Number(i.metres)} m)`}</span>}
              </td>
              <td className="py-2 pr-2 text-right">{i.quantity}</td>
              <td className="py-2 pr-2 text-right">{formatPrice(Number(i.unitPrice))}</td>
              <td className="py-2 text-right">{formatPrice(Number(i.lineTotal))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto w-full sm:w-72 space-y-1">
        <div className="flex justify-between"><span>Items total (GST included)</span><span>{formatPrice(subtotal)}</span></div>
        {discount > 0 && <div className="flex justify-between"><span>Coupon {order.couponCode}</span><span>-{formatPrice(discount)}</span></div>}
        <div className="flex justify-between text-muted"><span>Taxable value</span><span>{formatPrice(taxable)}</span></div>
        <div className="flex justify-between text-muted"><span>GST 5% (included above)</span><span>{formatPrice(gst)}</span></div>
        <div className="flex justify-between"><span>Shipping</span><span>{shipping ? formatPrice(shipping) : "Free"}</span></div>
        <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><span>Total</span><span>{formatPrice(Number(order.total))}</span></div>
        <p className="text-right text-muted pt-1">{paid}</p>
      </div>

      <p className="text-xs text-muted mt-10">This is a computer-generated invoice and needs no signature.</p>
    </div>
  );
}
