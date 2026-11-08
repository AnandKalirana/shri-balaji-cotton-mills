import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner, dbErrorResponse } from "@/lib/admin-guard";
import { importSampleCatalog } from "@/lib/seed-catalog";
import { revalidateStore } from "@/lib/revalidate";

export async function POST() {
  const guard = await requireOwner();
  if (guard.error) return guard.error;
  try {
    const created = await importSampleCatalog(prisma);
    revalidateStore();
    return NextResponse.json({ success: true, created });
  } catch (error) {
    return dbErrorResponse(error);
  }
}
