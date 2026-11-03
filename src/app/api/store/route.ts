import { NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/catalog";

/** Public store settings the storefront needs (shipping rules, announcement). */
export async function GET() {
  const s = await getStoreSettings();
  return NextResponse.json({
    announcementText: s.announcementText,
    enableAnnouncement: s.enableAnnouncement,
    freeShippingThreshold: s.freeShippingThreshold,
    standardShippingFee: s.standardShippingFee,
    enableCod: s.enableCod,
  });
}
