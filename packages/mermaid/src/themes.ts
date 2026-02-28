import { createTheme } from "@semajsx/style";
import type { StyleToken } from "@semajsx/style";
import { tokens } from "./tokens";

export const lightTheme: StyleToken = createTheme(tokens);

export const darkTheme: StyleToken = createTheme(tokens, {
  nodeFill: "rgba(41, 151, 255, 0.1)",
  nodeStroke: "#2997ff",
  nodeText: "#f5f5f7",
  edgeStroke: "#a1a1a6",
  edgeLabelBg: "#1c1c1e",
  edgeLabelText: "#a1a1a6",
  arrowFill: "#a1a1a6",
  subgraphFill: "rgba(255, 255, 255, 0.03)",
  subgraphStroke: "rgba(255, 255, 255, 0.12)",
  subgraphTitleBg: "#1c1c1e",
  subgraphTitleText: "#a1a1a6",
  actorFill: "rgba(41, 151, 255, 0.1)",
  actorStroke: "#2997ff",
  lifelineStroke: "rgba(255, 255, 255, 0.12)",
  activationFill: "rgba(41, 151, 255, 0.15)",
  messageStroke: "#f5f5f7",
  blockFill: "rgba(255, 255, 255, 0.03)",
  blockStroke: "rgba(255, 255, 255, 0.12)",
  noteBg: "rgba(255, 214, 10, 0.08)",
  noteStroke: "#ffd60a",
  noteText: "#f5f5f7",
});
