import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Invalid email address").max(120),
  phone: z.string().trim().regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number").optional(),
  password: z.string().min(10, "Password must be at least 10 characters").max(72, "Password is too long"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { fullName, email: rawEmail, phone, password } = parsed.data;
    const email = rawEmail.toLowerCase();

    const limited = await rateLimit(`register:ip:${clientIp(req)}`, 6, 60 * 60);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many accounts created from this connection. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email or phone already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone: phone || null,
        passwordHash,
        role: "CUSTOMER",
      },
    });

    const sessionPayload = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    await setSessionCookie(sessionPayload);

    return NextResponse.json({
      success: true,
      user: sessionPayload,
    });
  } catch (error) {
    console.error("[register]", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "We couldn't create your account right now. Please try again." },
      { status: 500 }
    );
  }
}

