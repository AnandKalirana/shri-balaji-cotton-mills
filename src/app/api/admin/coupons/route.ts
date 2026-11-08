import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwner, dbErrorResponse } from "@/lib/admin-guard";
import { logAdmin } from "@/lib/admin-log";

export async function GET() {
  const guard = await requireOwner();
  if (guard.error) return guard.error;
  try {
    const rows = await prisma.coupon.findMany({ orderBy: { validFrom: "desc" } });
    return NextResponse.json({
      coupons: rows.map((c) => ({
        id: c.id,
        code: c.code,
        discountPct: Number(c.discountPercent ?? 0),
        minOrder: Number(c.minOrderValue ?? 0),
        usageCount: c.usageCount,
        isActive: c.isActive,
        validUntil: c.validUntil.toISOString(),
      })),
    });
  } catch (error) {
    return dbErrorResponse(error);
  }
}

const schema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{3,20}$/, "Code must be 3–20 letters or numbers (no spaces)."),
  discountPct: z.number().min(1, "Discount must be at least 1%.").max(90, "Discount can't be more than 90%."),
  minOrder: z.number().min(0, "Minimum order can't be negative."),
  validUntil: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Choose a valid expiry date."),
});

export async function POST(req: Request) {
  const guard = await requireOwner();
  if (guard.error) return guard.error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const d = parsed.data;

  try {
    if (await prisma.coupon.findUnique({ where: { code: d.code } })) {
      return NextResponse.json({ error: `The code ${d.code} already exists.` }, { status: 409 });
    }
    const end = new Date(d.validUntil);
    end.setHours(23, 59, 59, 999);
    const created = await prisma.coupon.create({
      data: {
        code: d.code,
        discountPercent: d.discountPct,
        minOrderValue: d.minOrder,
        validFrom: new Date(),
        validUntil: end,
      },
    });
    await logAdmin(guard.user, "coupon.create", created.id);
    return NextResponse.json({ success: true, id: created.id });
  } catch (error) {
    return dbErrorResponse(error);
  }
}
