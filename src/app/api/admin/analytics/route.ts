import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { getProducts, mapOrder, demoOrders } from "@/lib/catalog";
import { dashboardStats as demoStats } from "@/lib/data";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { products, demo: demoCatalog } = await getProducts({ includeInactive: true });
  const lowStockItems = products.filter((p) => p.stockQty <= 5).length;

  try {
    const orderCount = await prisma.order.count();
    if (orderCount > 0) {
      const [revenue, recent] = await Promise.all([
        prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
        prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { items: true } }),
      ]);
      return NextResponse.json({
        demo: false,
        stats: {
          totalRevenue: Number(revenue._sum.total ?? 0),
          totalOrders: orderCount,
          totalProducts: products.length,
          lowStockItems,
        },
        recentOrders: recent.map(mapOrder),
      });
    }
  } catch {
    // fall through to sample figures
  }

  return NextResponse.json({
    demo: true,
    demoCatalog,
    stats: { ...demoStats, totalProducts: products.length, lowStockItems },
    recentOrders: demoOrders.slice(0, 5),
  });
}
