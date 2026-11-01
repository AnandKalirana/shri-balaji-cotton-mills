import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let banners: any[] = [];
    let settings: any = null;

    try {
      banners = await prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      });
      settings = await prisma.storeSettings.findUnique({
        where: { id: "default" },
      });
    } catch {
      // Fallback
    }

    if (!banners || banners.length === 0) {
      banners = [
        {
          id: "b1",
          eyebrow: "The Winter Couture Edition",
          title: "Banarasi Royal Brocade & Katan Silk",
          subtitle: "Hand-loomed in Varanasi with genuine gold and silver zari filaments.",
          ctaText: "Explore The Loom",
          ctaLink: "/category/banarasi-brocade",
          desktopImg: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920",
          mobileImg: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
        },
      ];
    }

    return NextResponse.json({ banners, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { banner, settings } = body;

    if (banner) {
      try {
        const created = await prisma.banner.create({ data: banner });
        return NextResponse.json({ success: true, banner: created });
      } catch {
        return NextResponse.json({ success: true, banner });
      }
    }

    if (settings) {
      try {
        const updated = await prisma.storeSettings.upsert({
          where: { id: "default" },
          update: settings,
          create: { id: "default", ...settings },
        });
        return NextResponse.json({ success: true, settings: updated });
      } catch {
        return NextResponse.json({ success: true, settings });
      }
    }

    return NextResponse.json({ error: "No payload provided" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
