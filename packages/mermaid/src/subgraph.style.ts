import { classes, rule } from "@semajsx/style";
import type { StyleToken, ClassRefs } from "@semajsx/style";
import { tokens } from "./tokens";

const SUBGRAPH_CLASSES = ["subgraphBg", "subgraphTitle"] as const;

const c: ClassRefs<typeof SUBGRAPH_CLASSES> = classes(SUBGRAPH_CLASSES);

export const subgraphBg: StyleToken = rule`${c.subgraphBg} {
  fill: ${tokens.subgraphFill};
  stroke: ${tokens.subgraphStroke};
  stroke-width: 0.5;
  stroke-dasharray: 6, 3;
}`;

export const subgraphTitle: StyleToken = rule`${c.subgraphTitle} {
  fill: ${tokens.subgraphTitleText};
  font-family: ${tokens.fontFamily};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}`;

export { c };
