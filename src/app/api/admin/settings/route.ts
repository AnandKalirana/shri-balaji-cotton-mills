import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, dbErrorResponse } from "@/lib/admin-guard";
import { getStoreSettings } from "@/lib/catalog";
import { revalidateStore } from "@/lib/revalidate";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  return NextResponse.json({ settings: await getStoreSettings() });
}

const schema = z.object({
  storeName: z.string().trim().min(1, "Store name is required.").max(80),
  supportPhone: z.string().trim().min(5, "Enter a valid phone number.").max(30),
  supportEmail: z.string().trim().email("Enter a valid contact email."),
  freeShippingThreshold: z.number().min(0, "Free shipping minimum can't be negative."),
  standardShippingFee: z.number().min(0, "Shipping fee can't be negative."),
  enableCod: z.boolean(),
});

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    const saved = await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: parsed.data,
      create: { id: "default", ...parsed.data },
    });
    revalidateStore();
    return NextResponse.json({ success: true, settings: saved });
  } catch (error) {
    return dbErrorResponse(error);
  }
}
