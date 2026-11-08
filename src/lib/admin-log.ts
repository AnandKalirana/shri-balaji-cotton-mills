import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";

/** Records who changed what. Never blocks the change if the log can't be written. */
export async function logAdmin(user: SessionUser, action: string, detail?: string) {
  try {
    await prisma.$executeRaw`
      INSERT INTO "AdminLog" ("id", "userId", "userEmail", "action", "detail")
      SELECT gen_random_uuid()::text, (SELECT "id" FROM "User" WHERE "id" = ${user.id}), ${user.email}, ${action.slice(0, 80)}, ${detail?.slice(0, 500) ?? null}`;
  } catch (e) {
    console.error("[admin-log] not recorded:", e instanceof Error ? e.message : e);
  }
}
