import { classes, rule } from "@semajsx/style";
import type { StyleToken, ClassRefs } from "@semajsx/style";
import { tokens } from "./tokens";

const EDGE_CLASSES = [
  "edgeLine",
  "edgeArrow",
  "edgeDotted",
  "edgeThick",
  "edgeAnimated",
  "edgeLabel",
  "edgeLabelBg",
  "arrowHead",
] as const;

const c: ClassRefs<typeof EDGE_CLASSES> = classes(EDGE_CLASSES);

export const edgeLine: StyleToken = rule`${c.edgeLine} {
  fill: none;
  stroke: ${tokens.edgeStroke};
  stroke-width: ${tokens.edgeWidth};
}`;

export const edgeDotted: StyleToken = rule`${c.edgeDotted} ${c.edgeLine} {
  stroke-dasharray: 6, 4;
}`;

export const edgeAnimated: StyleToken = rule`
${c.edgeAnimated} ${c.edgeLine} {
  stroke-dasharray: ${tokens.animatedDashArray};
  animation: mmd-dash-flow ${tokens.animatedDuration} linear infinite;
}
`;

export const edgeAnimatedKeyframes: StyleToken = rule`
@keyframes mmd-dash-flow {
  to {
    stroke-dashoffset: ${tokens.animatedDashOffset};
  }
}
`;

export const edgeThick: StyleToken = rule`${c.edgeThick} ${c.edgeLine} {
  stroke-width: 3;
}`;

export const edgeLabel: StyleToken = rule`${c.edgeLabel} {
  fill: ${tokens.edgeLabelText};
  font-family: ${tokens.fontFamily};
  font-size: 12px;
  text-anchor: middle;
  dominant-baseline: central;
}`;

export const edgeLabelBg: StyleToken = rule`${c.edgeLabelBg} {
  fill: ${tokens.edgeLabelBg};
  stroke: none;
}`;

export const arrowHead: StyleToken = rule`${c.arrowHead} {
  fill: none;
  stroke: ${tokens.arrowFill};
  stroke-width: ${tokens.edgeWidth};
  stroke-linecap: round;
  stroke-linejoin: round;
}`;

export { c };
