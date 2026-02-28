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
}`;

export const nodeShapeHover: StyleToken = rule`${c.nodeShape}:hover {
  filter: brightness(0.95);
  cursor: pointer;
}`;

export const nodeLabel: StyleToken = rule`${c.nodeLabel} {
  fill: ${tokens.nodeText};
  font-family: ${tokens.fontFamily};
  font-size: ${tokens.fontSize}px;
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
}`;

export { c };
