import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie, burnPasswordCheck } from "@/lib/auth";
import { clearRateLimit, clientIp, rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const lowerEmail = email.toLowerCase();

    // Slow down password guessing: per address and per account.
    const ip = clientIp(req);
    const ipKey = `login:ip:${ip}`;
    const emailKey = `login:email:${lowerEmail}`;
    const byIp = await rateLimit(ipKey, 30, 15 * 60);
    const byEmail = byIp.ok ? await rateLimit(emailKey, 8, 15 * 60) : byIp;
    if (!byIp.ok || !byEmail.ok) {
      const wait = Math.ceil(Math.max(byIp.retryAfter, byEmail.retryAfter) / 60);
      return NextResponse.json(
        { error: `Too many sign-in attempts. Please try again in ${wait} minute${wait === 1 ? "" : "s"}.` },
        { status: 429, headers: { "Retry-After": String(Math.max(byIp.retryAfter, byEmail.retryAfter)) } }
      );
    }

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: lowerEmail },
      });
    } catch {
      // In case DB is not yet migrated, fallback gracefully
      user = null;
    }

    if (!user) {
      await burnPasswordCheck(password);
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const sessionPayload = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    await clearRateLimit(emailKey);
    await setSessionCookie(sessionPayload);

    return NextResponse.json({
      success: true,
      user: sessionPayload,
    });
  } catch (error) {
    console.error("[login]", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "We couldn't sign you in right now. Please try again." },
      { status: 500 }
    );
  }
}

