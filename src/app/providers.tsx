"use client";

import Link from "next/link";
import { Theme } from "@astryxdesign/core/theme";
import { LinkProvider } from "@astryxdesign/core/Link";
import { balajiTheme } from "@/themes/balaji/balaji";

/** Gives every Astryx component the Shri Balaji look. The shop is light only. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Theme theme={balajiTheme} mode="light">
      <LinkProvider component={Link}>{children}</LinkProvider>
    </Theme>
  );
}
