/**
 * Built-in themes for @semajsx/ui
 *
 * Provides light (default) and dark themes. Custom themes can be
 * created using createTheme() from @semajsx/style.
 *
 * @example
 * ```tsx
 * import { lightTheme, darkTheme } from "@semajsx/ui/theme";
 * import { inject } from "@semajsx/style";
 *
 * // Apply default (light) theme to :root
 * inject(lightTheme);
 *
 * // Scope dark theme to an element
 * <div class={darkTheme}>
 *   <Button>Dark button</Button>
 * </div>
 * ```
 */

import { createTheme } from "@semajsx/style";
import { tokens } from "./tokens";

/**
 * Light theme - applies token defaults to :root
 */
export const lightTheme = createTheme(tokens);

/**
 * Dark theme - scoped to a CSS class
 */
export const darkTheme = createTheme(tokens, {
  colors: {
    primary: "#60a5fa",
    primaryHover: "#93bbfd",
    primaryActive: "#3b82f6",

    background: "#0f172a",
    surface: "#1e293b",
    border: "#334155",
    text: "#f1f5f9",
    textMuted: "#94a3b8",

    danger: "#f87171",
    dangerHover: "#fca5a5",
    success: "#4ade80",
    warning: "#fbbf24",

    onPrimary: "#0f172a",
    onDanger: "#0f172a",
  },
});
