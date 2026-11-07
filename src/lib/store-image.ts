import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { supabaseConfigured, uploadToSupabase } from "@/lib/supabase-storage";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_BYTES = 5 * 1024 * 1024;

/** Only public https sites: no internal addresses, no raw IPs, no odd ports. */
export function safeRemoteUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" || u.port) return null;
    const h = u.hostname.toLowerCase();
    if (!h.includes(".") || /^[\d.]+$/.test(h) || h.includes(":")) return null;
    if (/(^|\.)(localhost|local|internal|lan|home)$/.test(h)) return null;
    return u;
  } catch {
    return null;
  }
}

/** Downloads a photo from another site and saves it to our own storage. Returns the stored URL. */
export async function copyRemoteImage(raw: string): Promise<string> {
  const u = safeRemoteUrl(raw);
  if (!u) throw new Error("That photo link isn't a public https link.");

  const res = await fetch(u, { signal: AbortSignal.timeout(20000), redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (compatible; StoreImporter/1.0)" } });
  if (!res.ok) throw new Error(`The photo couldn't be downloaded (${res.status}).`);
  const type = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  const ext = TYPES[type];
  if (!ext) throw new Error("The link isn't a JPG, PNG or WebP photo.");
  const bytes = await res.arrayBuffer();
  if (bytes.byteLength > MAX_BYTES) throw new Error("The photo is larger than 5 MB.");
  if (bytes.byteLength < 500) throw new Error("The photo file is empty.");

  const name = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  if (supabaseConfigured()) return uploadToSupabase(name, bytes, type);

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(bytes));
  return `/uploads/${name}`;
}
