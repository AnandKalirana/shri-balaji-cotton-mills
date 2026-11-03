import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { mapOrder, demoOrders } from "@/lib/catalog";
import { toDbStatus } from "@/lib/order-status";

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const status = new URL(req.url).searchParams.get("status");
  try {
    const total = await prisma.order.count();
    if (total > 0) {
      const dbStatus = status && status !== "all" ? toDbStatus(status) : null;
      const rows = await prisma.order.findMany({
        where: dbStatus ? { orderStatus: dbStatus } : {},
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ orders: rows.map(mapOrder), demo: false });
    }
  } catch {
    // database unavailable — show sample orders, clearly flagged
  }

  const sample = status && status !== "all" ? demoOrders.filter((o) => o.status === status) : demoOrders;
  return NextResponse.json({ orders: sample, demo: true });
}
