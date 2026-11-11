import { NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getStoreSettings } from "@/lib/catalog";
import { sendMail } from "@/lib/mailer";
import { signResetToken, siteUrl } from "@/lib/reset-token";

const schema = z.object({ email: z.string().trim().email().max(120) });
// The same answer whether or not the email has an account, so nobody can use this to find out who shops here.
const SAME_ANSWER = { success: true, message: "If that email has an account, we have sent a link to reset the password. It works for 1 hour." };

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  const email = parsed.data.email.toLowerCase();

  const byIp = await rateLimit(`forgot:ip:${clientIp(req)}`, 10, 60 * 60);
  const byEmail = byIp.ok ? await rateLimit(`forgot:email:${email}`, 3, 60 * 60) : byIp;
  if (!byIp.ok || !byEmail.ok) {
    return NextResponse.json({ error: "Too many requests. Please try again in a while." }, { status: 429 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, passwordHash: true, fullName: true, email: true } });
    const base = siteUrl(req);
    if (user && base) {
      const link = `${base}/account/reset?token=${encodeURIComponent(signResetToken(user))}`;
      after(async () => {
        const settings = await getStoreSettings();
        const name = settings.storeName || "Shri Balaji Cotton Mills";
        await sendMail({
          to: user.email,
          subject: `Reset your ${name} password`,
          html: `<div style="font-family:Arial,sans-serif;max-width:520px;color:#1a1a1a"><p>Hi ${user.fullName.split(" ")[0].replace(/[<>&"]/g, "")},</p><p>Tap the button to choose a new password. The link works for 1 hour and only once.</p><p><a href="${link}" style="display:inline-block;background:#5c1d24;color:#fff;padding:12px 20px;text-decoration:none">Reset password</a></p><p style="font-size:12px;color:#777">If you did not ask for this, ignore this email. Your password stays the same.</p></div>`,
          text: `Reset your password (valid 1 hour, one use): ${link}\nIf you did not ask for this, ignore this email.`,
        });
      });
    } else if (user && !base) {
      console.error("[forgot] SITE_URL is not set, so no reset link was sent.");
    }
  } catch (e) {
    console.error("[forgot]", e instanceof Error ? e.message : e);
  }
  return NextResponse.json(SAME_ANSWER);
}
