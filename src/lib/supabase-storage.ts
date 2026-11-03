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

/** Uploads a file to the public bucket and returns its public https URL. */
export async function uploadToSupabase(name: string, body: ArrayBuffer, contentType: string): Promise<string> {
  const res = await fetch(`${base()}/storage/v1/object/${STORAGE_BUCKET}/${name}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
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
