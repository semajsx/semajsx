/**
 * Default design tokens for @semajsx/ui
 *
 * These tokens define the visual language of the component library.
 * All components reference these tokens via CSS custom properties,
 * enabling runtime theme switching.
 *
 * @example
 * ```ts
 * import { tokens } from "@semajsx/ui/theme";
 *
 * // Use in custom styles
 * const myRule = rule`${c.box} {
 *   color: ${tokens.colors.text};
 *   padding: ${tokens.space.md};
 * }`;
 * ```
 */

import { defineTokens } from "@semajsx/style";

export const tokens = defineTokens({
  colors: {
    // Brand
    primary: "#3b82f6",
    primaryHover: "#2563eb",
    primaryActive: "#1d4ed8",

    // Neutral
    background: "#ffffff",
    surface: "#f9fafb",
    border: "#e5e7eb",
    text: "#111827",
    textMuted: "#6b7280",

    // Semantic
    danger: "#ef4444",
    dangerHover: "#dc2626",
    success: "#22c55e",
    warning: "#f59e0b",

    // Inverse (for solid buttons, etc.)
    onPrimary: "#ffffff",
    onDanger: "#ffffff",
  },

  space: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
  },

  radii: {
    sm: "4px",
    md: "6px",
    lg: "8px",
    full: "9999px",
  },

  fonts: {
    base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"SF Mono", SFMono-Regular, Menlo, Consolas, monospace',
  },

  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
  },

  fontWeights: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  lineHeights: {
    tight: "1.25",
    normal: "1.5",
  },

  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  },

  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    normal: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
});
