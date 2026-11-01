import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orders as fallbackOrders } from "@/lib/data";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    try {
      const where: any = {};
      if (status && status !== "all") {
        where.orderStatus = status.toUpperCase();
      }

      const orders = await prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });

      if (orders && orders.length > 0) {
        return NextResponse.json({ orders });
      }
    } catch {
      // Fallback
    }

    let filtered = [...fallbackOrders];
    if (status && status !== "all") {
      filtered = filtered.filter((o) => o.status === status);
    }

    return NextResponse.json({ orders: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

