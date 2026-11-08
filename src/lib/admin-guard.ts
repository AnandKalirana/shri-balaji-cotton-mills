import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Guard =
  | { user: SessionUser; error?: undefined }
  | { user?: undefined; error: NextResponse };

/**
 * The signed-in owner or staff member, with their role read fresh from the database.
 * A removed or demoted person loses access straight away instead of when their login token expires.
 * If the database can't be reached, the role in the signed token is used.
 */
export async function getFreshStaffUser(): Promise<SessionUser | null> {
  const user = await getCurrentUser();
  if (!user || user.role === "CUSTOMER") return null;
  try {
    const row = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, email: true, fullName: true } });
    if (!row || row.role === "CUSTOMER") return null;
    return { ...user, role: row.role as SessionUser["role"], email: row.email, fullName: row.fullName };
  } catch {
    return user;
  }
}

/** Every /api/admin route calls this first. Only ADMIN and STAFF sessions pass. */
export async function requireAdmin(): Promise<Guard> {
  const token = await getCurrentUser();
  if (!token) {
    return { error: NextResponse.json({ error: "Please sign in to continue." }, { status: 401 }) };
  }
  const user = await getFreshStaffUser();
  if (!user) {
    return { error: NextResponse.json({ error: "You don't have access to the admin area." }, { status: 403 }) };
  }
  return { user };
}

/** Owner-only actions: settings, prices, coupons, banners, bulk import, uploads and sales figures. */
export async function requireOwner(): Promise<Guard> {
  const guard = await requireAdmin();
  if (guard.error) return guard;
  if (guard.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Only the store owner can do this." }, { status: 403 }) };
  }
  return guard;
}

/**
 * The built-in demo admin isn't a row in the User table, so it can't be used as a
 * foreign key (for example in inventory logs). Returns the id only if the user exists.
 */
export async function auditUserId(user: SessionUser): Promise<string | null> {
  try {
    const row = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true } });
    return row?.id ?? null;
  } catch {
    return null;
  }
}

/** Turns an unknown error into a short, safe message for the admin UI. */
export function dbErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  if (!/can't reach database|ECONNREFUSED|did not initialize|P1001|P1000|does not exist|P2021|P2022/i.test(message)) {
    console.error("[admin]", message);
  }
  const unreachable =
    /can't reach database|ECONNREFUSED|did not initialize|P1001|P1000|does not exist|P2021|P2022/i.test(message);
  return NextResponse.json(
    {
      error: unreachable
        ? "The database isn't connected or isn't set up yet, so this change was NOT saved. Check DATABASE_URL, then run prisma db push and prisma db seed."
        : "Something went wrong and the change was not saved. Please try again.",
    },
    { status: unreachable ? 503 : 500 }
  );
}
