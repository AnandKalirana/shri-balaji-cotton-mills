/** Looks at the first bytes of a file to see what it really is, instead of trusting the name or header. */
export function sniffImage(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return "image/png";
  const tag = (o: number, s: string) => [...s].every((c, i) => bytes[o + i] === c.charCodeAt(0));
  if (tag(0, "RIFF") && tag(8, "WEBP")) return "image/webp";
  return null;
}
