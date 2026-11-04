"use client";
import { useEffect, useState } from "react";

export interface PublicStoreSettings {
  freeShippingThreshold: number;
  standardShippingFee: number;
  enableCod: boolean;
  codMaxOrderLimit: number;
}

const DEFAULTS: PublicStoreSettings = { freeShippingThreshold: 2000, standardShippingFee: 150, enableCod: true, codMaxOrderLimit: 15000 };
let cached: PublicStoreSettings | null = null;

/** Shipping rules saved in the admin CMS, with safe defaults until they load. */
export function useStoreSettings(): PublicStoreSettings {
  const [settings, setSettings] = useState<PublicStoreSettings>(cached ?? DEFAULTS);
  useEffect(() => {
    if (cached) return;
    fetch("/api/store")
      .then((r) => r.json())
      .then((d) => {
        cached = {
          freeShippingThreshold: Number(d.freeShippingThreshold) || 0,
          standardShippingFee: Number(d.standardShippingFee) || 0,
          enableCod: Boolean(d.enableCod),
          codMaxOrderLimit: Number(d.codMaxOrderLimit) || 15000,
        };
        setSettings(cached);
      })
      .catch(() => undefined);
  }, []);
  return settings;
}
