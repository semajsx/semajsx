import type { StyleToken } from "semajsx/style";

/**
 * Extract CSS from StyleTokens for SSG build-time embedding
 */
export function extractThemeCss(theme: Record<string, unknown>): string {
  const cssStrings: string[] = [];
  for (const value of Object.values(theme)) {
    if (value && typeof value === "object" && "__cssTemplate" in value) {
      const token = value as StyleToken;
      cssStrings.push(token.__cssTemplate);
    }
  }
  return cssStrings.join("\n");
}
