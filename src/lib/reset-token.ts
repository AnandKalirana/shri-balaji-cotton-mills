import { createHash, createHmac } from "crypto";
import jwt from "jsonwebtoken";

/** Reset links are signed with their own key, so a reset token can never be accepted as a login session. */
function resetKey(): string {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32)) {
    throw new Error("JWT_SECRET must be set to a random string of at least 32 characters.");
  }
  return createHmac("sha256", secret || "dev-only-secret-do-not-use-in-production").update("password-reset").digest("hex");
}

/** Changes the moment the password changes, which makes a reset link work only once. */
const fingerprint = (passwordHash: string) => createHash("sha256").update(passwordHash).digest("hex").slice(0, 24);

export function signResetToken(user: { id: string; passwordHash: string }): string {
  return jwt.sign({ purpose: "reset", sub: user.id, f: fingerprint(user.passwordHash) }, resetKey(), { expiresIn: "1h", algorithm: "HS256" });
}

export function readResetToken(token: string): { userId: string; f: string } | null {
  try {
    const p = jwt.verify(token, resetKey(), { algorithms: ["HS256"] }) as { purpose?: string; sub?: string; f?: string };
    if (p.purpose !== "reset" || !p.sub || !p.f) return null;
    return { userId: p.sub, f: p.f };
  } catch {
    return null;
  }
}

export const resetStillValid = (f: string, passwordHash: string) => f === fingerprint(passwordHash);

/** Where reset links point. Never taken from the request, so a forged Host header cannot redirect them. */
export function siteUrl(req: Request): string | null {
  const configured = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  if (configured) return configured.replace(/\/+$/, "");
  return process.env.NODE_ENV === "production" ? null : new URL(req.url).origin;
}
