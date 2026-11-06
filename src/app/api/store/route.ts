import { NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/catalog";

/** Public store settings the storefront needs (shipping rules, announcement). */
export async function GET() {
  const s = await getStoreSettings();
  return NextResponse.json(
    {
    storeName: s.storeName,
    supportPhone: s.supportPhone,
    supportEmail: s.supportEmail,
    legalName: s.legalName,
    gstin: s.gstin,
    address: s.address,
    businessHours: s.businessHours,
    instagramUrl: s.instagramUrl,
    facebookUrl: s.facebookUrl,
    youtubeUrl: s.youtubeUrl,
    announcementText: s.announcementText,
    enableAnnouncement: s.enableAnnouncement,
    freeShippingThreshold: s.freeShippingThreshold,
    standardShippingFee: s.standardShippingFee,
    enableCod: s.enableCod,
    codMaxOrderLimit: s.codMaxOrderLimit,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
