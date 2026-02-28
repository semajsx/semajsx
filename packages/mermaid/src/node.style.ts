import { classes, rule } from "@semajsx/style";
import type { StyleToken, ClassRefs } from "@semajsx/style";
import { tokens } from "./tokens";

const NODE_CLASSES = [
  "node",
  "nodeShape",
  "nodeRect",
  "nodeRound",
  "nodeCircle",
  "nodeRhombus",
  "nodeHexagon",
  "nodeCylinder",
  "nodeStadium",
  "nodeLabel",
] as const;

const c: ClassRefs<typeof NODE_CLASSES> = classes(NODE_CLASSES);

export const nodeShape: StyleToken = rule`${c.nodeShape} {
  fill: ${tokens.nodeFill};
  stroke: ${tokens.nodeStroke};
  stroke-width: ${tokens.edgeWidth};
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.06));
  transition: filter 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}`;

export const nodeShapeHover: StyleToken = rule`${c.nodeShape}:hover {
  filter: drop-shadow(0 4px 12px rgba(0, 113, 227, 0.15));
  cursor: pointer;
}`;

export const nodeLabel: StyleToken = rule`${c.nodeLabel} {
  fill: ${tokens.nodeText};
  font-family: ${tokens.fontFamily};
  font-size: ${tokens.fontSize}px;
  font-weight: 500;
  letter-spacing: -0.01em;
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
}`;

export { c };
