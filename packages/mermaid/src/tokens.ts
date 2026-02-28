import { createTheme, defineTokens } from "@semajsx/style";
import type { StyleToken, TokenRefs } from "@semajsx/style";

const tokenDefinition = {
  // Node — light primary tint with primary blue stroke
  nodeFill: "#f0f7ff",
  nodeStroke: "#0071e3",
  nodeText: "#1d1d1f",
  nodeRadius: "10",

  // Edge — soft tertiary tones for connectors
  edgeStroke: "#86868b",
  edgeWidth: "1.5",
  edgeLabelBg: "#fbfbfd",
  edgeLabelText: "#6e6e73",

  // Arrow
  arrowFill: "#86868b",

  // Animation
  animatedDashArray: "5, 5",
  animatedDuration: "0.5s",
  animatedDashOffset: "-10",

  // Subgraph — surface background with subtle border
  subgraphFill: "#f5f5f7",
  subgraphStroke: "rgba(0, 0, 0, 0.08)",
  subgraphTitleBg: "#f0f0f2",
  subgraphTitleText: "#6e6e73",

  // Sequence — primary-tinted actors, amber notes
  actorFill: "#f0f7ff",
  actorStroke: "#0071e3",
  lifelineStroke: "#d2d2d7",
  activationFill: "rgba(0, 113, 227, 0.08)",
  messageStroke: "#1d1d1f",
  blockFill: "rgba(0, 0, 0, 0.02)",
  blockStroke: "rgba(0, 0, 0, 0.08)",
  noteBg: "#fffbeb",
  noteStroke: "#ff9f0a",
  noteText: "#1d1d1f",

  // General — system font stack matching @semajsx/ui
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: "14",
} as const;

export const tokens: TokenRefs<typeof tokenDefinition> = defineTokens(tokenDefinition);

/**
 * Default mermaid theme — sets CSS custom properties on :root.
 * Embed its __cssTemplate in an SVG <style> for self-contained rendering.
 */
export const defaultTheme: StyleToken = createTheme(tokens);
