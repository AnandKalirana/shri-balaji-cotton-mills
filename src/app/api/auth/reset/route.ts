import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { readResetToken, resetStillValid } from "@/lib/reset-token";

const schema = z.object({
  token: z.string().min(20).max(2000),
  password: z.string().min(10, "Password must be at least 10 characters").max(72, "Password is too long"),
});
const BAD_LINK = "This reset link is invalid or has expired. Please ask for a new one.";

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || BAD_LINK }, { status: 400 });

  const limited = await rateLimit(`reset:ip:${clientIp(req)}`, 20, 60 * 60);
  if (!limited.ok) return NextResponse.json({ error: "Too many attempts. Please try again in a while." }, { status: 429 });

  const claim = readResetToken(parsed.data.token);
  if (!claim) return NextResponse.json({ error: BAD_LINK }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({ where: { id: claim.userId }, select: { id: true, passwordHash: true } });
    if (!user || !resetStillValid(claim.f, user.passwordHash)) return NextResponse.json({ error: BAD_LINK }, { status: 400 });
    // The link stops working once the password changes (it is tied to the old password hash).
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.password) } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[reset]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "We couldn't reset your password right now. Please try again." }, { status: 500 });
  }
}
