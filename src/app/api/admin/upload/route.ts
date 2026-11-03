import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/admin-guard";
import { keyProblem, supabaseConfigured, uploadToSupabase } from "@/lib/supabase-storage";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Stores an uploaded product/banner photo and returns its URL.
 * Uses Supabase Storage when configured, otherwise public/uploads (local development only).
 */
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Only JPG, PNG or WebP images are allowed." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image must be 5 MB or smaller." }, { status: 400 });

  const name = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const bytes = await file.arrayBuffer();

  if (supabaseConfigured()) {
    const wrongKey = keyProblem();
    if (wrongKey) return NextResponse.json({ error: wrongKey }, { status: 500 });
    try {
      const url = await uploadToSupabase(name, bytes, file.type);
      return NextResponse.json({ success: true, url });
    } catch (e) {
      console.error(e);
      return NextResponse.json(
        { error: "Couldn't save the image to Supabase Storage. Check the bucket name and keys in your environment settings." },
        { status: 502 }
      );
    }
  }

  try {
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), Buffer.from(bytes));
    return NextResponse.json({ success: true, url: `/uploads/${name}` });
  } catch {
    return NextResponse.json(
      { error: "Couldn't store the image on this server. Set up Supabase Storage or paste an image link instead." },
      { status: 500 }
    );
  }
}
