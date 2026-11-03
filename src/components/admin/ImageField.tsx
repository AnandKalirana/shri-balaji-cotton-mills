"use client";
import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { validateImageRef } from "@/lib/images";

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helper?: string;
  /** Opens the phone camera directly on mobile. */
  camera?: boolean;
}

/** Upload a photo (saved on the server) or paste an image link, with a live preview. */
export function ImageField({ label, value, onChange, helper, camera }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const linkProblem = value && !value.startsWith("blob:") ? validateImageRef(value) : null;

  async function upload(file: File) {
    setError("");
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Upload failed. Please try again.");
      else onChange(data.url);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-[11px] tracking-[0.14em] uppercase font-semibold text-[#534343] mb-2">
        {label}
      </label>

      <div className="flex items-start gap-4">
        <div className="relative w-28 h-28 shrink-0 rounded-2xl bg-[#f0ede9] overflow-hidden flex items-center justify-center">
          {value && !linkProblem ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-6 h-6 text-[#c5a880]" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-[#5c1d24]" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 rounded-full bg-[#5c1d24] text-white text-xs font-semibold hover:bg-[#2b1e1a] active:scale-95 transition-all disabled:opacity-50 min-h-[36px]"
            >
              {value ? "Replace photo" : camera ? "Take or choose photo" : "Upload photo"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                aria-label="Remove image"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#534343] hover:bg-[#2b1e1a]/5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <input
            type="url"
            value={value.startsWith("/uploads/") ? "" : value}
            onChange={(e) => {
              setError("");
              onChange(e.target.value.trim());
            }}
            placeholder={value.startsWith("/uploads/") ? "Uploaded ✓  (or paste an https:// link)" : "…or paste an image link (https://)"}
            className="w-full bg-transparent border-0 border-b border-[#c5a880] py-2 text-sm text-[#2b1e1a] placeholder:text-[#867273] focus:outline-none focus:border-[#5c1d24]"
          />
          {(error || linkProblem) && (
            <p role="alert" className="text-xs text-[#ba1a1a]">
              {error || linkProblem}
            </p>
          )}
          {helper && !error && !linkProblem && <p className="text-xs text-[#867273]">{helper}</p>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        {...(camera ? { capture: "environment" as const } : {})}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
        className="hidden"
      />
    </div>
  );
}
