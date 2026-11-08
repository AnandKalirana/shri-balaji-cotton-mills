import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { lookup as dnsLookup } from "node:dns";
import https from "node:https";
import path from "node:path";
import { supabaseConfigured, uploadToSupabase } from "@/lib/supabase-storage";
import { isPrivateAddress } from "@/lib/net-guard";
import { sniffImage } from "@/lib/image-sniff";

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 3;

/** Only public https sites: no internal addresses, no raw IPs, no odd ports. */
export function safeRemoteUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" || u.port || u.username || u.password) return null;
    const h = u.hostname.toLowerCase();
    if (!h.includes(".") || /^[\d.]+$/.test(h) || h.includes(":")) return null;
    if (/(^|\.)(localhost|local|internal|lan|home)$/.test(h)) return null;
    return u;
  } catch {
    return null;
  }
}

/** Looks the name up and refuses it if it points at a private address. Used for the real connection too, so the checked address is the one that is used. */
const guardedLookup: typeof dnsLookup = ((hostname: string, options: unknown, callback: unknown) => {
  const cb = (typeof options === "function" ? options : callback) as (err: Error | null, address?: unknown, family?: number) => void;
  const opts = (typeof options === "object" && options ? options : {}) as { all?: boolean };
  dnsLookup(hostname, { all: true }, (err, results) => {
    if (err) return cb(err);
    const list = results as { address: string; family: number }[];
    if (!list.length || list.some((r) => isPrivateAddress(r.address))) {
      return cb(new Error("That photo link points to a private address."));
    }
    if (opts.all) return cb(null, list);
    cb(null, list[0].address, list[0].family);
  });
}) as typeof dnsLookup;

/** Fetches one URL over https, follows at most a few redirects (each one re-checked), and stops reading at 5 MB. */
function fetchBytes(raw: string, hops = 0): Promise<{ bytes: Buffer; type: string }> {
  return new Promise((resolve, reject) => {
    const u = safeRemoteUrl(raw);
    if (!u) return reject(new Error("That photo link isn't a public https link."));
    const req = https.get(
      u,
      { lookup: guardedLookup, timeout: 20000, headers: { "User-Agent": "Mozilla/5.0 (compatible; StoreImporter/1.0)", Accept: "image/*" } },
      (res) => {
        const status = res.statusCode ?? 0;
        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume();
          if (hops >= MAX_REDIRECTS) return reject(new Error("The photo link redirects too many times."));
          let next: string;
          try {
            next = new URL(res.headers.location, u).toString();
          } catch {
            return reject(new Error("The photo link redirects somewhere invalid."));
          }
          return fetchBytes(next, hops + 1).then(resolve, reject);
        }
        if (status < 200 || status >= 300) {
          res.resume();
          return reject(new Error(`The photo couldn't be downloaded (${status}).`));
        }
        const declared = Number(res.headers["content-length"] || 0);
        if (declared > MAX_BYTES) {
          res.resume();
          return reject(new Error("The photo is larger than 5 MB."));
        }
        const chunks: Buffer[] = [];
        let total = 0;
        res.on("data", (c: Buffer) => {
          total += c.length;
          if (total > MAX_BYTES) {
            req.destroy(new Error("The photo is larger than 5 MB."));
            return;
          }
          chunks.push(c);
        });
        res.on("end", () => resolve({ bytes: Buffer.concat(chunks), type: String(res.headers["content-type"] || "") }));
        res.on("error", reject);
      }
    );
    req.on("timeout", () => req.destroy(new Error("The photo took too long to download.")));
    req.on("error", (e) => reject(e));
  });
}

/** Downloads a photo from another site and saves it to our own storage. Returns the stored URL. */
export async function copyRemoteImage(raw: string): Promise<string> {
  if (!safeRemoteUrl(raw)) throw new Error("That photo link isn't a public https link.");

  const { bytes } = await fetchBytes(raw);
  if (bytes.byteLength < 500) throw new Error("The photo file is empty.");
  // Go by what the file really is, not by what the other site says it is.
  const type = sniffImage(bytes);
  if (!type) throw new Error("The link isn't a JPG, PNG or WebP photo.");

  const name = `${Date.now()}-${randomUUID().slice(0, 8)}.${EXT[type]}`;
  if (supabaseConfigured()) return uploadToSupabase(name, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer, type);

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return `/uploads/${name}`;
}
