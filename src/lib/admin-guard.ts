import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Guard =
  | { user: SessionUser; error?: undefined }
  | { user?: undefined; error: NextResponse };

/** Every /api/admin route calls this first. Only ADMIN and STAFF sessions pass. */
export async function requireAdmin(): Promise<Guard> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Please sign in to continue." }, { status: 401 }) };
  }
  if (user.role === "CUSTOMER") {
    return { error: NextResponse.json({ error: "You don't have access to the admin area." }, { status: 403 }) };
  }
  return { user };
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
  const unreachable =
    /can't reach database|ECONNREFUSED|did not initialize|P1001|P1000|does not exist|P2021|P2022/i.test(message);
  return NextResponse.json(
    {
      error: unreachable
        ? "The database isn't connected or isn't set up yet, so this change was NOT saved. Check DATABASE_URL, then run prisma db push and prisma db seed."
        : message,
    },
    { status: unreachable ? 503 : 500 }
  );
}
