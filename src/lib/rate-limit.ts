import { prisma } from "@/lib/prisma";

/** The caller's address as the host reports it (Vercel and most hosts set x-forwarded-for). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip")?.trim();
  return ip || "unknown";
}

/**
 * Counts one attempt against `key` and says whether it is allowed.
 * `limit` attempts are allowed per `windowSeconds`. Uses the database so the count is shared
 * between server instances. If the table is missing or the database errors, it lets the request
 * through (and logs) rather than blocking real customers.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<{ ok: boolean; retryAfter: number }> {
  try {
    // One atomic statement: start a new window if the old one is over, otherwise add one.
    const rows = await prisma.$queryRaw<{ count: number; seconds: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt", "updatedAt")
      VALUES (${key}, 1, now() + (${windowSeconds} * interval '1 second'), now())
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."resetAt" <= now() THEN 1 ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" <= now() THEN now() + (${windowSeconds} * interval '1 second') ELSE "RateLimit"."resetAt" END,
        "updatedAt" = now()
      RETURNING "count", CEIL(EXTRACT(EPOCH FROM ("resetAt" - now())))::int AS "seconds"`;
    const row = rows[0];
    if (row && Number(row.count) > limit) return { ok: false, retryAfter: Math.max(1, Number(row.seconds)) };
    return { ok: true, retryAfter: 0 };
  } catch (e) {
    console.error("[rate-limit] could not check, allowing the request:", e instanceof Error ? e.message : e);
    return { ok: true, retryAfter: 0 };
  }
}

/** Forgets a key, for example after a successful login. */
export async function clearRateLimit(key: string) {
  try {
    await prisma.$executeRaw`DELETE FROM "RateLimit" WHERE "key" = ${key}`;
  } catch {
    /* nothing to clear */
  }
}

/** Removes counters whose time is over. Cheap; called now and then. */
export async function sweepRateLimits() {
  try {
    await prisma.$executeRaw`DELETE FROM "RateLimit" WHERE "resetAt" < now()`;
  } catch {
    /* ignore */
  }
}
