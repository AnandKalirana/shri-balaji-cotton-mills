import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";

/**
 * Shri Balaji Cotton Mills: warm paper, deep wine accent, sand lines.
 * Light only. The shop has no dark mode, so the theme is always shown in light.
 */
export const balajiTheme = defineTheme({
  name: "balaji",
  extends: neutralTheme,
  typography: {
    body: { family: "var(--font-jakarta)", fallbacks: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
    heading: { family: "var(--font-jakarta)", fallbacks: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  },
  radius: { base: 4, multiplier: 0.5 },
  tokens: {
    "--color-accent": "#5c1d24",
    "--color-accent-muted": "#5c1d2426",
    "--color-on-accent": "#ffffff",
    "--color-text-accent": "#5c1d24",
    "--color-icon-accent": "#5c1d24",
    "--color-background-body": "#fcf9f4",
    "--color-background-surface": "#ffffff",
    "--color-background-card": "#ffffff",
    "--color-background-popover": "#ffffff",
    "--color-background-inverted": "#1a1a1a",
    "--color-text-primary": "#1a1a1a",
    "--color-text-secondary": "#6f6f6f",
    "--color-icon-primary": "#1a1a1a",
    "--color-icon-secondary": "#6f6f6f",
    "--color-border": "#e5e5e3",
    "--color-border-emphasized": "#c5a880",
    "--color-error": "#ba1a1a",
    // Message boxes: soft tints with dark text, like the shop used before.
    "--color-info-muted": "#1a1a1a0a",
    "--color-on-info-muted": "#1a1a1a",
    "--color-success-muted": "#ecfdf5",
    "--color-on-success-muted": "#064e3b",
    "--color-warning-muted": "#fffbeb",
    "--color-on-warning-muted": "#78350f",
    "--color-error-muted": "#fff1f2",
    "--color-on-error-muted": "#881337",
  },
});
