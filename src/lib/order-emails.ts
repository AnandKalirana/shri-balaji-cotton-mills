import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/catalog";
import { sendMail } from "@/lib/mailer";
import { whatsappUrl } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/utils";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

async function loadOrder(orderId: string) {
  return prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
}
type LoadedOrder = NonNullable<Awaited<ReturnType<typeof loadOrder>>>;

function itemLines(order: LoadedOrder) {
  return order.items.map((i) => {
    const length = i.metres != null ? (i.isFullThaan ? " (full thaan)" : ` (${Number(i.metres)} m)`) : "";
    return { label: `${i.productName}${length} × ${i.quantity}`, amount: formatPrice(Number(i.lineTotal)) };
  });
}

function addressText(order: LoadedOrder) {
  const a = order.shippingAddressSnapshot as { street?: string; city?: string; state?: string; pincode?: string } | null;
  return a ? `${a.street}, ${a.city}, ${a.state} - ${a.pincode}` : "";
}

function shell(storeName: string, heading: string, bodyHtml: string) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
<h2 style="margin:0 0 16px;font-size:20px">${esc(heading)}</h2>${bodyHtml}
<p style="margin-top:28px;font-size:12px;color:#777">${esc(storeName)}</p></div>`;
}

function itemsTable(order: LoadedOrder) {
  const rows = itemLines(order).map((l) => `<tr><td style="padding:6px 0">${esc(l.label)}</td><td style="padding:6px 0;text-align:right">${l.amount}</td></tr>`).join("");
  const shipping = Number(order.shippingFee);
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;border-top:1px solid #ddd;border-bottom:1px solid #ddd">${rows}
${Number(order.discountTotal) > 0 ? `<tr><td style="padding:6px 0;color:#555">Coupon ${esc(order.couponCode ?? "")}</td><td style="padding:6px 0;text-align:right">-${formatPrice(Number(order.discountTotal))}</td></tr>` : ""}
<tr><td style="padding:6px 0;color:#555">Shipping</td><td style="padding:6px 0;text-align:right">${shipping ? formatPrice(shipping) : "Free"}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold">Total</td><td style="padding:8px 0;text-align:right;font-weight:bold">${formatPrice(Number(order.total))}</td></tr></table>`;
}

/** Called once an order is confirmed (Cash on Delivery placed, or online payment received). */
export async function notifyOrderPlaced(orderId: string) {
  const [order, settings] = await Promise.all([loadOrder(orderId), getStoreSettings()]);
  if (!order) return;
  const storeName = settings.storeName || "Shri Balaji Cotton Mills";
  const pay = order.paymentMethod === "COD" ? "Cash on Delivery" : "Paid online";

  const customerHtml = shell(
    storeName,
    `Thank you, ${order.customerName.split(" ")[0]}. We have your order.`,
    `<p style="font-size:14px">Order <b>${esc(order.orderNumber)}</b> · ${pay}</p>${itemsTable(order)}
<p style="font-size:14px"><b>Delivering to</b><br>${esc(order.customerName)}<br>${esc(addressText(order))}</p>
<p style="font-size:14px">We will email you again when it ships. Questions? Reply to this email or call ${esc(settings.supportPhone)}.</p>`
  );
  await sendMail({
    to: order.customerEmail,
    subject: `Order ${order.orderNumber} confirmed`,
    html: customerHtml,
    text: `Thank you. Order ${order.orderNumber} (${pay}) total ${formatPrice(Number(order.total))}. We will email you when it ships.`,
    replyTo: settings.supportEmail,
  });

  // Alert to the owner, with a one-tap WhatsApp link to the customer.
  const wa = whatsappUrl(order.customerPhone, `Hi ${order.customerName.split(" ")[0]}, this is ${storeName}. We received your order ${order.orderNumber}. `);
  const ownerHtml = shell(
    storeName,
    `New order ${order.orderNumber}: ${formatPrice(Number(order.total))}`,
    `<p style="font-size:14px">${pay}</p>${itemsTable(order)}
<p style="font-size:14px"><b>${esc(order.customerName)}</b><br>${esc(order.customerPhone)} · ${esc(order.customerEmail)}<br>${esc(addressText(order))}</p>
<p><a href="${wa}" style="display:inline-block;background:#1f7a4d;color:#fff;padding:10px 16px;text-decoration:none;font-size:14px">Message customer on WhatsApp</a></p>`
  );
  await sendMail({
    to: process.env.ORDER_ALERT_EMAIL || settings.supportEmail,
    subject: `New order ${order.orderNumber} · ${formatPrice(Number(order.total))} · ${pay}`,
    html: ownerHtml,
    text: `New order ${order.orderNumber}, ${formatPrice(Number(order.total))}, ${pay}. ${order.customerName} ${order.customerPhone}. ${addressText(order)}`,
  });
}

/** Called when the owner moves an order to Shipped, Delivered or Cancelled. */
export async function notifyOrderStatus(orderId: string) {
  const [order, settings] = await Promise.all([loadOrder(orderId), getStoreSettings()]);
  if (!order) return;
  const storeName = settings.storeName || "Shri Balaji Cotton Mills";
  let subject = "";
  let heading = "";
  let extra = "";
  if (order.orderStatus === "SHIPPED") {
    subject = `Order ${order.orderNumber} has shipped`;
    heading = "Your order is on its way";
    extra = order.trackingNumber
      ? `<p style="font-size:14px">Courier: <b>${esc(order.courierPartner || "")}</b><br>Tracking number: <b>${esc(order.trackingNumber)}</b></p>`
      : "";
  } else if (order.orderStatus === "DELIVERED") {
    subject = `Order ${order.orderNumber} delivered`;
    heading = "Your order has been delivered";
  } else if (order.orderStatus === "CANCELLED") {
    subject = `Order ${order.orderNumber} cancelled`;
    heading = "Your order was cancelled";
    extra = `<p style="font-size:14px">If you paid online, the refund goes back to your original payment method. Call ${esc(settings.supportPhone)} for help.</p>`;
  } else return;
  await sendMail({
    to: order.customerEmail,
    subject,
    html: shell(storeName, heading, `<p style="font-size:14px">Order <b>${esc(order.orderNumber)}</b></p>${extra}`),
    text: `${heading}. Order ${order.orderNumber}.${order.trackingNumber ? ` Tracking: ${order.courierPartner || ""} ${order.trackingNumber}` : ""}`,
    replyTo: settings.supportEmail,
  });
}
