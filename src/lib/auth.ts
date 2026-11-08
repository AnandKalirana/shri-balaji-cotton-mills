import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const DEV_ONLY_SECRET = "dev-only-secret-do-not-use-in-production";

/** The signing secret. Required in production; a throwaway value is used only for local development. */
function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set to a random string of at least 32 characters.");
  }
  return secret || DEV_ONLY_SECRET;
}
const TOKEN_NAME = "ha_session_token";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: "CUSTOMER" | "ADMIN" | "STAFF";
}

/** Hash password with salt */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** Verify password against hash */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

let dummyHash: string | null = null;
/** Spends the same time as a real check, so an unknown email can't be told apart by how fast login answers. */
export async function burnPasswordCheck(password: string): Promise<void> {
  dummyHash ??= await bcrypt.hash("not-a-real-password", 12);
  await bcrypt.compare(password, dummyHash);
}

/** Owners and staff stay signed in for 1 day, customers for 7. */
const DAY = 60 * 60 * 24;
export function sessionSeconds(role: SessionUser["role"]): number {
  return role === "CUSTOMER" ? 7 * DAY : DAY;
}

/** Sign JWT session token */
export function signSessionToken(payload: SessionUser): string {
  return jwt.sign(payload, jwtSecret(), { expiresIn: sessionSeconds(payload.role), algorithm: "HS256" });
}

/** Verify JWT session token */
export function verifySessionToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, jwtSecret(), { algorithms: ["HS256"] }) as SessionUser;
  } catch {
    return null;
  }
}

/** Get session user from incoming request cookies (Server Component / API Route) */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

/** Set session cookie */
export async function setSessionCookie(user: SessionUser) {
  const token = signSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionSeconds(user.role),
  });
}

/** Clear session cookie */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

