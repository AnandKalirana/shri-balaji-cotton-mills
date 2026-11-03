/**
 * Image hosts that next/image is configured for (see next.config.ts).
 * Locally uploaded files live under /uploads and are always allowed.
 */
export const ALLOWED_IMAGE_HOSTS = [
  "images.unsplash.com",
  "lh3.googleusercontent.com",
  "stitch.googleapis.com",
];

/** Returns an error message if the image reference can't be displayed, otherwise null. */
export function validateImageRef(ref: string): string | null {
  if (ref.startsWith("/uploads/")) return null;
  try {
    const u = new URL(ref);
    if (u.protocol !== "https:") return "Image links must start with https://";
    if (!ALLOWED_IMAGE_HOSTS.includes(u.hostname)) {
      return `Images from ${u.hostname} aren't enabled yet. Upload the file instead, or add the host to next.config.ts.`;
    }
    return null;
  } catch {
    return "That doesn't look like a valid image link.";
  }
}
