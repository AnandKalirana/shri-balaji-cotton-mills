"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export interface LiveStoreInfo {
  storeName: string;
  supportPhone: string;
  supportEmail: string;
  legalName: string;
  gstin: string;
  address: string;
  businessHours: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  announcementText: string;
  enableAnnouncement: boolean;
}

/**
 * The header and footer live in a layout, and Next.js does not re-render layouts when a visitor
 * moves between pages. This keeps them in step with what was saved in the admin by re-reading the
 * public settings after each page change. It starts from the server-rendered values, so nothing flickers.
 */
export function useLiveStoreInfo(initial: LiveStoreInfo): LiveStoreInfo {
  const [info, setInfo] = useState(initial);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/store", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d || cancelled) return;
        setInfo((prev) => ({ ...prev, ...pickInfo(d) }));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return info;
}

function pickInfo(d: Record<string, unknown>): Partial<LiveStoreInfo> {
  const out: Partial<LiveStoreInfo> = {};
  const str = (k: keyof LiveStoreInfo) => {
    if (typeof d[k] === "string") (out as Record<string, unknown>)[k] = d[k];
  };
  (["storeName", "supportPhone", "supportEmail", "legalName", "gstin", "address", "businessHours", "instagramUrl", "facebookUrl", "youtubeUrl", "announcementText"] as const).forEach(str);
  if (typeof d.enableAnnouncement === "boolean") out.enableAnnouncement = d.enableAnnouncement;
  return out;
}
