/**
 * Supabase Storage (product & banner photos).
 * Uses Supabase's REST API directly, so no extra package is needed.
 * Configure with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and (optionally) SUPABASE_STORAGE_BUCKET.
 * The service-role key is secret: it is only ever used on the server.
 */
export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "product-images";

export function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function base() {
  return process.env.SUPABASE_URL!.replace(/\/+$/, "");
}

export function supabaseHost(): string | null {
  try {
    return process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : null;
  } catch {
    return null;
  }
}

/** Explains the most common setup mistake: using the public key where the secret key is needed. */
export function keyProblem(): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (key.startsWith("sb_publishable_")) {
    return "SUPABASE_SERVICE_ROLE_KEY holds the publishable (public) key. Use the secret key (starts with sb_secret_) or the service_role key instead.";
  }
  if (key.startsWith("eyJ")) {
    try {
      const role = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role;
      if (role && role !== "service_role") {
        return `SUPABASE_SERVICE_ROLE_KEY holds the "${role}" key. Use the service_role key instead (Project Settings > API Keys).`;
      }
    } catch {
      // not a readable JWT, let Supabase decide
    }
  }
  return null;
}

/** Uploads a file to the public bucket and returns its public https URL. */
export async function uploadToSupabase(name: string, body: ArrayBuffer, contentType: string): Promise<string> {
  const res = await fetch(`${base()}/storage/v1/object/${STORAGE_BUCKET}/${name}`, {
    method: "POST",
    headers: {
      // New-style secret keys (sb_secret_...) go in the apikey header only; legacy keys are JWTs.
      ...(process.env.SUPABASE_SERVICE_ROLE_KEY!.startsWith("eyJ")
        ? { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` }
        : {}),
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      "Content-Type": contentType,
      "Cache-Control": "31536000",
      "x-upsert": "false",
    },
    body,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Supabase upload failed (${res.status}): ${detail.slice(0, 200)}`);
  }
  return `${base()}/storage/v1/object/public/${STORAGE_BUCKET}/${name}`;
}
