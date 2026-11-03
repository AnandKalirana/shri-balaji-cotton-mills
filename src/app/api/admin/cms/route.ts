import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, dbErrorResponse } from "@/lib/admin-guard";
import { getActiveBanner, getStoreSettings } from "@/lib/catalog";
import { DEFAULT_HERO } from "@/lib/hero";
import { validateImageRef } from "@/lib/images";
import { revalidateStore } from "@/lib/revalidate";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const [banner, settings] = await Promise.all([getActiveBanner(), getStoreSettings()]);
  return NextResponse.json({
    demo: settings.demo,
    banner: banner ?? { ...DEFAULT_HERO, id: null, isActive: true },
    settings,
  });
}

const imageRef = z.string().min(1, "Please add a banner image.").superRefine((v, ctx) => {
  const problem = validateImageRef(v);
  if (problem) ctx.addIssue({ code: "custom", message: problem });
});

const saveSchema = z.object({
  settings: z.object({
    announcementText: z.string().trim().max(200, "Announcement is too long (200 characters max)."),
    enableAnnouncement: z.boolean(),
    freeShippingThreshold: z.number().min(0, "Free shipping minimum can't be negative."),
    codMaxOrderLimit: z.number().min(0, "COD limit can't be negative."),
  }),
  banner: z.object({
    eyebrow: z.string().trim().max(80).optional().default(""),
    title: z.string().trim().min(1, "Banner headline is required.").max(120),
    subtitle: z.string().trim().max(300).optional().default(""),
    ctaText: z.string().trim().min(1, "Button text is required.").max(40),
    ctaLink: z
      .string()
      .trim()
      .refine((v) => v.startsWith("/") || /^https:\/\//.test(v), "Button link must start with / or https://"),
    desktopImg: imageRef,
    mobileImg: imageRef,
    isActive: z.boolean(),
  }),
});

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const parsed = saveSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { settings, banner } = parsed.data;

  try {
    const [savedSettings, savedBanner] = await prisma.$transaction(async (tx) => {
      const s = await tx.storeSettings.upsert({
        where: { id: "default" },
        update: settings,
        create: { id: "default", ...settings },
      });
      const current = await tx.banner.findFirst({ orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] });
      const b = current
        ? await tx.banner.update({ where: { id: current.id }, data: banner })
        : await tx.banner.create({ data: { ...banner, sortOrder: 1 } });
      return [s, b] as const;
    });
    revalidateStore();
    return NextResponse.json({ success: true, settings: savedSettings, banner: savedBanner });
  } catch (error) {
    return dbErrorResponse(error);
  }
}
