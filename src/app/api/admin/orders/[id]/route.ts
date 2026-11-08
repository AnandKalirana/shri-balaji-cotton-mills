import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, dbErrorResponse } from "@/lib/admin-guard";
import { logAdmin } from "@/lib/admin-log";
import { mapOrder, demoOrders } from "@/lib/catalog";
import { toDbStatus } from "@/lib/order-status";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id } = await params;

  try {
    const row = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (row) {
      return NextResponse.json({
        order: mapOrder(row),
        courier: row.courierPartner ?? "",
        tracking: row.trackingNumber ?? "",
        demo: false,
      });
    }
  } catch {
    // fall through
  }
  const sample = demoOrders.find((o) => o.id === id);
  if (!sample) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ order: sample, courier: "", tracking: "", demo: true });
}

const schema = z.object({
  orderStatus: z.string().optional(),
  trackingNumber: z.string().trim().max(80).optional(),
  courierPartner: z.string().trim().max(80).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { orderStatus, trackingNumber, courierPartner } = parsed.data;

  let status = undefined;
  if (orderStatus) {
    status = toDbStatus(orderStatus);
    if (!status) return NextResponse.json({ error: `Unknown status "${orderStatus}".` }, { status: 400 });
  }

  try {
    const existing = await prisma.order.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json(
        { error: "This is a sample order, not a real one, so it can't be changed." },
        { status: 404 }
      );
    }
    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(status ? { orderStatus: status } : {}),
        ...(trackingNumber !== undefined ? { trackingNumber: trackingNumber || null } : {}),
        ...(courierPartner !== undefined ? { courierPartner: courierPartner || null } : {}),
      },
    });
    await logAdmin(guard.user, "order.update", `${updated.orderNumber} -> ${updated.orderStatus}${trackingNumber ? ", tracking added" : ""}`);
    return NextResponse.json({ success: true, status: updated.orderStatus });
  } catch (error) {
    return dbErrorResponse(error);
  }
}
